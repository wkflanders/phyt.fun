'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePurchasePack } from '@/hooks/use-purchase-pack';
import { useGetUser } from '@/hooks/use-get-user';
import { Loader2, Sparkles } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';
import { TokenURIMetadata, CardRarity } from '@phyt/types';

const getRarityColor = (rarity: CardRarity | undefined) => {
    switch (rarity?.toLowerCase()) {
        case 'opal': return 'text-yellow-400';
        case 'ruby': return 'text-red-400';
        case 'sapphire': return 'text-blue-400';
        case 'gold': return 'text-amber-400';
        case 'silver': return 'text-gray-300';
        case 'bronze': return 'text-orange-400';
        default: return 'text-white';
    }
};

const getRarityBorderGlow = (rarity: CardRarity | undefined) => {
    switch (rarity?.toLowerCase()) {
        case 'opal': return 'animate-pulse border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]';
        case 'ruby': return 'animate-pulse border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        case 'sapphire': return 'animate-pulse border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
        case 'gold': return 'animate-pulse border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
        case 'silver': return 'border-gray-300';
        case 'bronze': return 'border-orange-400';
        default: return 'border-white';
    }
};

const PackPurchase = () => {
    const [isRotated, setIsRotated] = useState(false);
    const [isPurchaseComplete, setIsPurchaseComplete] = useState(false);
    const [revealedCard, setRevealedCard] = useState<TokenURIMetadata | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const { toast } = useToast();
    const { address } = useAccount();
    const { ready, user: privyUser } = usePrivy();
    const { data: user, isFetching, error } = useGetUser();
    const { mutate: purchasePack, isPending } = usePurchasePack();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    const handlePurchase = () => {
        if (!ready || !address || !user?.id) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!balance || balance.value < parseEther("0.0001")) {
            toast({
                title: "Error",
                description: "Insufficient balance - you need at least 0.0001 ETH",
                variant: "destructive",
            });
            return;
        }

        purchasePack(
            {
                buyerId: user.id,
                buyerAddress: address as `0x${string}`
            },
            {
                onSuccess: (data) => {
                    setIsRotated(true);
                    setIsPurchaseComplete(true);

                    if (data.cardsMetadata?.[0]) {
                        // Start reveal animation
                        setTimeout(() => {
                            setIsRevealing(true);
                            setRevealedCard(data.cardsMetadata[0]);
                        }, 1000);
                    }
                },
                onError: (error) => {
                    if (error.message.includes("User rejected the request")) {
                        toast({
                            title: "Transaction cancelled",
                            variant: 'destructive'
                        });
                        return;
                    }
                    toast({
                        title: "Error",
                        description: error.message || "Failed to purchase pack",
                        variant: "destructive",
                    });
                }
            }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-phyt_gray p-4">
            <div className="max-w-md w-full space-y-8">
                {!isPurchaseComplete ? (
                    <Card className="relative w-full h-96 bg-transparent perspective-1000">
                        <div
                            className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${isRotated ? 'rotate-y-180' : ''
                                }`}
                            onClick={() => setIsRotated(!isRotated)}
                        >
                            {/* Front of the pack */}
                            <CardContent className="absolute w-full h-full bg-gradient-to-br from-phyt_form to-phyt_gray border-2 border-phyt_form_border rounded-xl p-6 backface-hidden">
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <img
                                        src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v"
                                        alt="Pack"
                                        className="w-32 h-32 object-contain mb-4 hover:scale-110 transition-transform duration-300"
                                    />
                                    <h2 className="text-2xl font-bold text-phyt_text text-center">Mystery Pack</h2>
                                    <p className="text-phyt_text_secondary text-center">
                                        Contains 1 Runner NFT with random rarity
                                    </p>
                                    <div className="mt-4">
                                        <p className="text-phyt_blue text-xl font-bold">0.0001 ETH</p>
                                    </div>
                                </div>
                            </CardContent>

                            {/* Back of the pack */}
                            <CardContent className="absolute w-full h-full bg-gradient-to-br from-phyt_form to-phyt_gray border-2 border-phyt_form_border rounded-xl p-6 backface-hidden rotate-y-180">
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <h3 className="text-xl font-bold text-phyt_text">Rarity Chances</h3>
                                    <div className="space-y-4 w-full">
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-400">Bronze</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[50%] bg-orange-400 rounded"></div>
                                            </div>
                                            <span className="text-orange-400 w-12 text-right">50%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-300">Silver</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[25%] bg-gray-300 rounded"></div>
                                            </div>
                                            <span className="text-gray-300 w-12 text-right">25%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-amber-400">Gold</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[15%] bg-amber-400 rounded"></div>
                                            </div>
                                            <span className="text-amber-400 w-12 text-right">15%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-400">Sapphire</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[7%] bg-blue-400 rounded"></div>
                                            </div>
                                            <span className="text-blue-400 w-12 text-right">7%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-red-400">Ruby</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[2%] bg-red-400 rounded"></div>
                                            </div>
                                            <span className="text-red-400 w-12 text-right">2%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-yellow-400">Opal</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-800 rounded">
                                                <div className="h-full w-[1%] bg-yellow-400 rounded"></div>
                                            </div>
                                            <span className="text-yellow-400 w-12 text-right">1%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                ) : (
                    <div className="relative w-full h-96">
                        {revealedCard && (
                            <div className={`transform transition-all duration-1000 ${isRevealing ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                }`}>
                                <Card className={`w-full h-96 border-4 ${getRarityBorderGlow(revealedCard.attributes[0].rarity)} bg-gradient-to-br from-phyt_form to-phyt_gray p-6`}>
                                    <CardContent className="flex flex-col items-center justify-center h-full">
                                        <div className="absolute top-4 right-4">
                                            <Sparkles className={`w-6 h-6 ${getRarityColor(revealedCard.attributes[0].rarity)}`} />
                                        </div>
                                        <img
                                            src={revealedCard.image}
                                            alt={revealedCard.name}
                                            className="w-48 h-48 object-cover rounded-lg mb-4"
                                        />
                                        <h3 className="text-xl font-bold text-phyt_text mb-2">{revealedCard.name}</h3>
                                        <p className={`text-lg font-semibold mb-2 ${getRarityColor(revealedCard.attributes[0].rarity)}`}>
                                            {revealedCard.attributes[0].rarity}
                                        </p>
                                        <p className="text-phyt_text_secondary">
                                            Multiplier: {revealedCard.attributes[0].multiplier}x
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    onClick={handlePurchase}
                    disabled={isPending || !ready || isPurchaseComplete}
                    className="w-full h-12 bg-phyt_blue hover:bg-blue-100 text-black font-bold"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Purchasing...
                        </>
                    ) : isPurchaseComplete ? (
                        'Pack Opened!'
                    ) : (
                        'Purchase Pack'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PackPurchase;