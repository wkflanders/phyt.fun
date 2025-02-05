'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePurchasePack } from '@/hooks/use-purchase-pack';
import { useGetUser } from '@/hooks/use-get-user';
import { Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { TokenURIMetadata } from '@phyt/types';

const PackPurchase = () => {
    const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);
    const [isPackDisappearing, setIsPackDisappearing] = useState(false);
    const [showCard, setShowCard] = useState(false);
    const [revealedCard, setRevealedCard] = useState<TokenURIMetadata | null>(null);

    const { toast } = useToast();
    const { address } = useAccount();
    const { ready } = usePrivy();
    const { data: user } = useGetUser();
    const { mutate: purchasePack, isPending } = usePurchasePack();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    const handlePurchase = () => {
        if (!ready || !address || !user?.id) {
            toast({
                title: 'Error',
                description: 'Please connect your wallet first',
                variant: 'destructive',
            });
            return;
        }

        if (!balance || balance.value < parseEther('0.0001')) {
            toast({
                title: 'Error',
                description: 'Insufficient balance – you need at least 0.0001 ETH',
                variant: 'destructive',
            });
            return;
        }

        purchasePack(
            {
                buyerId: user.id,
                buyerAddress: address as `0x${string}`,
            },
            {
                onSuccess: (data) => {
                    setIsPurchaseComplete(true);
                    if (data.cardsMetadata?.[0]) {
                        setRevealedCard(data.cardsMetadata[0]);
                    }
                    setTimeout(() => {
                        setIsPackDisappearing(true);
                        setTimeout(() => {
                            setShowCard(true);
                        }, 750);
                    }, 500);
                },
                onError: (error: any) => {
                    if (error.message.includes('User rejected the request')) {
                        toast({
                            title: 'Transaction cancelled',
                            variant: 'destructive',
                        });
                        return;
                    }
                    toast({
                        title: 'Error',
                        description: error.message || 'Failed to purchase pack',
                        variant: 'destructive',
                    });
                },
            }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="relative w-full flex flex-col items-center pt-8">
                {/* Container for animations */}
                <div className="relative w-96 h-96">
                    {/* Pack */}
                    {(!isPurchaseComplete || isPackDisappearing) && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                transition: 'all 750ms cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isPackDisappearing ? 'scale(0.1)' : 'scale(1)',
                                opacity: isPackDisappearing ? '0' : '1',
                                zIndex: isPackDisappearing ? 0 : 2
                            }}
                        >
                            <img
                                src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF010pjQxYM4A9LIyVQelGKUJ5iPZqbu3rRfgX"
                                alt="Closed Mystery Pack"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* Revealed Card with Glow Effects */}
                    {revealedCard && (
                        <div
                            className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out
                                ${showCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                            style={{ zIndex: showCard ? 2 : 0 }}
                        >
                            {/* Glow Effects */}
                            <div className="absolute inset-0 -z-10">
                                {/* Circular gradient glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse opacity-50" />

                                {/* Firework-like particles */}
                                <div className="absolute inset-0">
                                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full blur animate-ping" />
                                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full blur animate-ping delay-150" />
                                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full blur animate-ping delay-300" />
                                    <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full blur animate-ping delay-500" />
                                    <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-green-400 rounded-full blur animate-ping delay-700" />
                                </div>
                            </div>

                            {/* Card Image */}
                            <img
                                src={revealedCard.image}
                                alt={revealedCard.name}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>
                    )}
                </div>

                {/* Purchase Button */}
                {!isPurchaseComplete && (
                    <div className="mt-8">
                        <Button
                            onClick={handlePurchase}
                            disabled={isPending || !ready}
                            className="w-96 h-12 bg-phyt_blue hover:bg-blue-100 text-black font-bold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Purchasing...
                                </>
                            ) : (
                                'Purchase Pack | 0.0001 ETH'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackPurchase;