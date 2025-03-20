'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePurchasePack } from '@/hooks/use-purchase-pack';
import { useGetUser } from '@/hooks/use-users';
import { Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { TokenURIMetadata, PackTypes, PackType } from '@phyt/types';

export const Packs = () => {
    const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);
    const [isPackDisappearing, setIsPackDisappearing] = useState(false);
    const [showCard, setShowCard] = useState(false);
    const [revealedCards, setRevealedCards] = useState<TokenURIMetadata[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [selectedPack, setSelectedPack] = useState<string | null>(null);
    const [packPrice, setPackPrice] = useState<string | null>(null);
    const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const { toast } = useToast();
    const { address } = useAccount();
    const { ready } = usePrivy();
    const { data: user } = useGetUser();
    const { mutate: purchasePack, isPending } = usePurchasePack();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    const handlePurchase = async (packType: string, price: string) => {
        if (!ready || !address || !user?.id) {
            toast({
                title: 'Error',
                description: 'Please connect your wallet and select a pack',
                variant: 'destructive',
            });
            return;
        }
        setLoadingPackId(packType);
        setSelectedPack(packType);
        setPackPrice(price);
        const parsedPrice = parseEther(price);
        if (!balance || balance.value < parsedPrice) {
            toast({
                title: 'Error',
                description: `Insufficient balance – you need at least ${price} ETH`,
                variant: 'destructive',
            });
            setLoadingPackId(null);
            return;
        }
        purchasePack(
            {
                buyerId: user.id,
                buyerAddress: address as `0x${string}`,
                packType: packType as PackType,
            },
            {
                onSuccess: (data) => {
                    setIsPurchaseComplete(true);
                    if (data.cardsMetadata?.length) {
                        setRevealedCards(data.cardsMetadata);
                    }
                    setTimeout(() => {
                        setIsPackDisappearing(true);
                        setTimeout(() => {
                            setShowCard(true);
                        }, 750);
                    }, 500);
                },
                onError: (error: any) => {
                    setLoadingPackId(null);
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
                onSettled: () => {
                    if (!isPurchaseComplete) {
                        setLoadingPackId(null);
                    }
                },
            }
        );
    };

    const handleNextCard = () => {
        if (currentCardIndex < revealedCards.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentCardIndex((prev) => prev + 1);
                setIsTransitioning(false);
            }, 300);
        } else {
            setIsPurchaseComplete(false);
            setIsPackDisappearing(false);
            setShowCard(false);
            setCurrentCardIndex(0);
            setRevealedCards([]);
            setLoadingPackId(null);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
            {!isPurchaseComplete ? (
                <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PackTypes.map((pack) => (
                            <div
                                key={pack.id}
                                className={`bg-gradient-to-br ${pack.bgGradient} backdrop-blur-sm rounded-xl p-6 flex flex-col items-center`}
                            >
                                <div className="relative w-96 h-96 mb-4">
                                    <img
                                        src={pack.image}
                                        alt={`${pack.name} Pack`}
                                        className="object-contain w-full h-full hover:scale-105 transition-all duration-300"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl text-white">{pack.name}</h3>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger>
                                                <HelpCircle className="h-5 w-5 text-text-dim" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-900 bg-opacity-70 backdrop-blur-xl text-text text-lg max-w-lg">
                                                <p>{pack.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="text-lg text-text mb-4">{pack.price} ETH</div>
                                <Button
                                    variant="outline"
                                    onClick={() => handlePurchase(pack.id, pack.price)}
                                    disabled={isPending || loadingPackId !== null}
                                    className="px-24 py-6 bg-zinc-900 bg-opacity-20 backdrop-blur-xl border-white/10 hover:bg-white/10 rounded-xl"
                                >
                                    {loadingPackId === pack.id ? (
                                        <>
                                            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-text animate-spin mr-2"></div>
                                            Opening...
                                        </>
                                    ) : (
                                        `Open`
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative w-full flex flex-col items-center pt-8">
                    <div className="relative w-96 h-96">
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
                                    zIndex: isPackDisappearing ? 0 : 2,
                                }}
                            >
                                <img
                                    src={
                                        PackTypes.find((p) => p.id === selectedPack)?.image ||
                                        'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF010pjQxYM4A9LIyVQelGKUJ5iPZqbu3rRfgX'
                                    }
                                    alt={`${selectedPack} Pack`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        {revealedCards.length > 0 && (
                            <div
                                className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out ${showCard ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                                    } ${isTransitioning ? 'scale-75 opacity-0' : ''}`}
                                style={{ zIndex: showCard ? 2 : 0 }}
                            >
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse opacity-50" />
                                    <div className="absolute inset-0">
                                        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full blur animate-ping" />
                                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full blur animate-ping delay-150" />
                                        <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full blur animate-ping delay-300" />
                                        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full blur animate-ping delay-500" />
                                        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-green-400 rounded-full blur animate-ping delay-700" />
                                    </div>
                                </div>
                                <img
                                    src={revealedCards[currentCardIndex]?.image}
                                    alt={revealedCards[currentCardIndex]?.name}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                {revealedCards.length > 1 && (
                                    <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 text-white">
                                        {currentCardIndex + 1} / {revealedCards.length}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {showCard && (
                        <Button
                            variant="outline"
                            onClick={handleNextCard}
                            className="mt-8 w-64 h-12 bg-zinc-900 bg-opacity-20 backdrop-blur-xl border-white/10 hover:bg-white/10 rounded-xl"
                        >
                            {currentCardIndex < revealedCards.length - 1 ? 'Next Card' : 'Done'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
