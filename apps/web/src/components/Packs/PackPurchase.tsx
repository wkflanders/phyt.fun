'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PackPurchaseResponse } from "@phyt/types";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePurchasePack } from '@/hooks/use-purchase-pack';
import { useGetUser } from '@/hooks/use-get-user';
import { Loader2 } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { parseEther } from 'viem';

const PackPurchase = () => {
    const [isRotated, setIsRotated] = useState(false);
    const { toast } = useToast();
    const { address } = useAccount();
    const { ready, user: privyUser } = usePrivy();
    const { data: user, isFetching, error } = useGetUser();

    const { mutate: purchasePack, isPending } = usePurchasePack();

    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    const handlePurchase = async () => {
        if (!ready || !address || !user?.id) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!balance || balance.value < parseEther("0.1")) {
            toast({
                title: "Error",
                description: "Insufficient balance - you need at least 0.1 ETH",
                variant: "destructive",
            });
            return;
        }

        try {
            purchasePack(
                {
                    buyerId: user.id,
                    buyerAddress: address as `0x${string}`
                },
                {
                    onSuccess: (data: PackPurchaseResponse) => {
                        setIsRotated(true);
                        setTimeout(() => setIsRotated(false), 1000);
                    },
                }
            );
        } catch (error) {
            console.error('Purchase error:', error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-phyt_gray p-4">
            <div className="max-w-md w-full space-y-8">
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
                                    className="w-32 h-32 object-contain mb-4"
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
                                <div className="space-y-2 w-full">
                                    <div className="flex justify-between">
                                        <span className="text-phyt_text">Common</span>
                                        <span className="text-phyt_text_secondary">70%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-phyt_text">Rare</span>
                                        <span className="text-phyt_text_secondary">20%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-phyt_text">Exotic</span>
                                        <span className="text-phyt_text_secondary">8%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-phyt_text">Legendary</span>
                                        <span className="text-phyt_text_secondary">2%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>

                <Button
                    onClick={handlePurchase}
                    disabled={!ready}
                    className="w-full h-12 bg-phyt_blue hover:bg-blue-100 text-black font-bold"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Purchasing...
                        </>
                    ) : (
                        'Purchase Pack'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PackPurchase;