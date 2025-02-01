import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { MinterAbi } from "@phyt/contracts";
import type { Address } from 'viem';
import { simulateContract, writeContract } from "wagmi/actions";
import { PackDetails, PackPurchaseInput, PackPurchaseResponse } from "@phyt/types";
import { notifyServerPackTxn, fetchPackDetails } from "@/queries/packs";
import { config } from "@/lib/wagmi";

const MINTER = '0x7Ee08f7d4707F94C2f2664327D16cF6b30cA87D1';

export function usePurchasePack() {
    const { toast } = useToast();

    return useMutation<PackPurchaseResponse, Error, PackPurchaseInput>({
        mutationFn: async ({ buyerId, buyerAddress }: PackPurchaseInput) => {
            // Get config and price
            const { mintConfigId, packPrice, merkleProof } = await fetchPackDetails(buyerAddress as `0x${string}`) as PackDetails;

            console.log('Proof array:', merkleProof);

            const { request } = await simulateContract(config, {
                address: MINTER,
                abi: MinterAbi,
                functionName: 'mint',
                args: [BigInt(mintConfigId), merkleProof],
                value: BigInt(packPrice),
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
                packPrice
            });

            console.log(response);
            return response;
        },
        onSuccess: (cardsMetadata) => {
            toast({
                title: "Success",
            });
        },
        onError: (error: Error) => {
            if (error.message.includes("User rejected the request")) {
                toast({
                    title: "Transaction cancelled",
                });
                return;
            }
            console.log(error);
            toast({
                title: "Error",
                description: error.message || "Failed to mint pack",
                variant: "destructive",
            });
        }
    });
}