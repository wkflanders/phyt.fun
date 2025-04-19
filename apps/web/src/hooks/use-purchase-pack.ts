import { env } from '@/env';
import { MinterAbi } from '@phyt/contracts';
import {
    PackPurchaseInput,
    PackPurchaseResponse,
    AuthenticationError
} from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { simulateContract, writeContract } from 'wagmi/actions';

import { config } from '@/lib/wagmi';
import { notifyServerPackTxn, fetchPackDetails } from '@/queries/packs';

import { useToast } from './use-toast';

export function usePurchasePack() {
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();
    const [packPrice, setPackPrice] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { user: privyUser } = usePrivy();

    const mutation = useMutation<
        PackPurchaseResponse,
        Error,
        PackPurchaseInput
    >({
        mutationFn: async ({ buyerId, buyerAddress, packType }) => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            // Get config and price
            const packDetails = await fetchPackDetails(
                buyerAddress,
                packType,
                token
            );
            const {
                mintConfigId,
                packPrice: fetchedPrice,
                merkleProof
            } = packDetails;

            // Store the pack price for components to use
            setPackPrice(fetchedPrice);

            // console.log('Proof array:', merkleProof);
            // console.log('Pack type:', packType);

            const { request } = await simulateContract(config, {
                address: env.NEXT_PUBLIC_MINTER_ADDRESS as `0x${string}`,
                abi: MinterAbi,
                functionName: 'mint',
                args: [BigInt(mintConfigId), merkleProof],
                value: BigInt(fetchedPrice),
                account: buyerAddress
            });

            // Execute transaction with two arguments
            const hash = await writeContract({ ...config }, { ...request });
            // console.log(hash);
            // Notify server
            const response = await notifyServerPackTxn(
                {
                    buyerId,
                    hash,
                    packPrice: fetchedPrice,
                    packType
                },
                token
            );

            // console.log(response);
            return response;
        },
        onSuccess: (cardsMetadata) => {
            toast({
                title: 'Success',
                description: 'Pack opened successfully!'
            });

            // Invalidate and refetch userCards query
            queryClient.invalidateQueries({
                queryKey: ['userCards', privyUser?.id]
            });
        },
        onError: (error: Error) => {
            // console.log(error);
            if (error.message.includes('User rejected the request')) {
                toast({
                    title: 'Transaction cancelled'
                });
                return;
            }
            if (error.message.includes('ContractFunctionExecutionError')) {
                toast({
                    title: 'Failed to mint pack. Please try again'
                });
                return;
            }
            if (error.message.includes('Pack purchase error')) {
                toast({
                    title: 'Error executing pack mint. Please contact admins if you were charged but have not recieved your pack rewards'
                });
                return;
            }
            toast({
                title: 'Error',
                description: error.message || 'Failed to mint pack',
                variant: 'destructive'
            });
        }
    });

    return {
        ...mutation,
        packPrice
    };
}
