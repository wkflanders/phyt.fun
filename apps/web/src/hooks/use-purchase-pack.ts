import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { purchasePack } from "@/queries/packs";
import { PackPurchaseInput, PackPurchaseResponse } from "@phyt/types";

export function usePurchasePack() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    return useMutation<PackPurchaseResponse, Error, PackPurchaseInput>({
        mutationFn: purchasePack,
        onSuccess: (data) => {
            toast({
                title: 'Success',
                description: `Successfully purchased pack. Transaction: ${data.hash.slice(0, 6)}...${data.hash.slice(-4)}`,
            });
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['packs'] });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to purchase pack',
                variant: 'destructive'
            });
        }
    });
}