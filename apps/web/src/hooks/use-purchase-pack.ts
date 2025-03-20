import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { MinterAbi } from "@phyt/contracts";
import type { Address } from 'viem';
import { simulateContract, writeContract } from "wagmi/actions";
import { PackDetails, PackPurchaseInput, PackPurchaseResponse } from "@phyt/types";
import { notifyServerPackTxn, fetchPackDetails } from "@/queries/packs";
import { config } from "@/lib/wagmi";
import { usePrivy } from '@privy-io/react-auth';
import { useState } from "react";

const MINTER = '0x7Ee08f7d4707F94C2f2664327D16cF6b30cA87D1';

export function usePurchasePack() {
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();
    const [packPrice, setPackPrice] = useState<string | null>(null);

    const mutation = useMutation<PackPurchaseResponse, Error, PackPurchaseInput>({
        mutationFn: async ({ buyerId, buyerAddress, packType }) => {
            const token = await getAccessToken();
            // Get config and price
            const packDetails = await fetchPackDetails(buyerAddress as `0x${string}`, packType, token) as PackDetails;
            const { mintConfigId, packPrice: fetchedPrice, merkleProof } = packDetails;

            // Store the pack price for components to use
            setPackPrice(fetchedPrice);

            console.log('Proof array:', merkleProof);
            console.log('Pack type:', packType);

            const { request } = await simulateContract(config, {
                address: MINTER,
                abi: MinterAbi,
                functionName: 'mint',
                args: [BigInt(mintConfigId), merkleProof],
                value: BigInt(fetchedPrice),
                account: buyerAddress as Address,
            });

            // Execute transaction with two arguments
            const hash = await writeContract(
                { ...config },
                { ...request }
            );
            console.log(hash);
            // Notify server    
            const response = await notifyServerPackTxn({
                buyerId,
                hash,
                packPrice: fetchedPrice,
                packType
            }, token);

            console.log(response);
            return response;
        },
        onSuccess: (cardsMetadata) => {
            toast({
                title: "Success",
                description: "Pack opened successfully!",
            });
        },
        onError: (error: Error) => {
            console.log(error);
            if (error.message.includes("User rejected the request")) {
                toast({
                    title: "Transaction cancelled",
                });
                return;
            }
            if (error.message.includes("ContractFunctionExecutionError")) {
                toast({
                    title: "Failed to mint pack. Please try again",
                });
                return;
            }
            if (error.message.includes("Pack purchase error")) {
                toast({
                    title: "Error executing pack mint. Please contact admins if you were charged but have not recieved your pack rewards"
                });
                return;
            }
            toast({
                title: "Error",
                description: error.message || "Failed to mint pack",
                variant: "destructive",
            });
        }
    });

    return {
        ...mutation,
        packPrice
    };
}