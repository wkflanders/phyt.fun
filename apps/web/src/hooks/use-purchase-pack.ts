import { useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { purchasePack } from "@/queries/packs";

export function usePurchasePack() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: purchasePack,
        onSuccess: (data) => {
            toast({
                title: 'Success',
                description: `Successfully purchase pack. Transaction hash: ${data.hash.slice(0, 6)}...${data.hash.slice(-4)}`,
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to purchase pack',
                variant: 'destructive'
            });
        }
    });
}