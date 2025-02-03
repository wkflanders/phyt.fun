import { useMutation } from '@tanstack/react-query';
import { useWalletClient, useAccount } from 'wagmi';
import { useToast } from './use-toast';
import { useExchange } from './use-exchange';
import { Order } from '@phyt/types';
import { generateOrderHash } from '@/lib/orderUtils';

export function useCreateOrder() {
    const { signOrder } = useExchange();
    const { data: walletClient } = useWalletClient();
    const { address } = useAccount();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (input: Order) => {
            if (!walletClient || !address) {
                throw new Error('Wallet not connected');
            }

            const order = {
                trader: address,
                side: input.side,
                collection: input.collection,
                token_id: input.token_id,
                payment_token: input.payment_token || '0x0000000000000000000000000000000000000000',
                price: input.price,
                expiration_time: BigInt(Math.floor(Date.now() / 1000)) + (input.expiration_time ? (typeof input.expiration_time === 'number' ? BigInt(input.expiration_time) : input.expiration_time) : BigInt(7 * 24 * 60 * 60)),
                merkle_root: input.merkle_root || '0x0000000000000000000000000000000000000000000000000000000000000000',
                salt: BigInt(Math.floor(Math.random() * 1000000))
            };

            const signature = await signOrder(order);
            const orderHash = await generateOrderHash(order);

            return {
                order,
                signature,
                orderHash
            };
        },
        onError: (error: Error) => {
            toast({
                title: 'Error Creating Order',
                description: error.message,
                variant: 'destructive',
            });
        }
    });
}