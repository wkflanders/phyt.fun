import Image from 'next/image';
import React from 'react';

import { Loader2, Heart, MessageCircle, Share2 } from 'lucide-react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { formatEther } from 'viem';

import { CardRarity, Listing, MarketListing } from '@phyt/types';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface MarketModalProps {
    marketListing: MarketListing | null;
    isOpen: boolean;
    onClose: () => void;
    onBuyNow: (listing: Listing) => void;
    isPurchasing: boolean;
}

const getRarityColor = (rarity: CardRarity) => {
    const colors = {
        bronze: 'text-orange-600',
        silver: 'text-gray-400',
        gold: 'text-yellow-400',
        sapphire: 'text-blue-400',
        ruby: 'text-red-400',
        opal: 'text-purple-400'
    };
    return colors[rarity] || 'text-gray-400';
};

export const MarketModal = ({
    marketListing,
    isOpen,
    onClose,
    onBuyNow,
    isPurchasing
}: MarketModalProps) => {
    const { toast } = useToast();

    if (!marketListing) return null;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="bg-waves_card w-full max-w-6xl max-h-[90vh] overflow-y-hidden">
                <VisuallyHidden>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </VisuallyHidden>
                <div className="grid grid-cols-2 grid-rows-2 gap-4">
                    {/* (1,1) Card Image */}
                    <div className="col-span-1 row-span-1 flex justify-center items-center">
                        <Image
                            src={marketListing.metadata.imageUrl}
                            alt={`Card ${String(marketListing.listing.orderData.tokenId)}`}
                            width={200}
                            height={300}
                            className="rounded-lg w-[300px] h-[500px]"
                        />
                    </div>

                    {/* (1,2) Price Over Time Chart */}
                    <div className="col-span-1 row-span-1">
                        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                            <p className="text-white">Price Over Time Chart</p>
                        </div>
                    </div>

                    {/* (2,1) Price Info & Actions */}
                    <div className="col-span-1 row-span-1">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="bg-black p-4 rounded-lg border border-gray-800 flex-1">
                                    <p className="text-sm text-phyt_text_secondary mb-1">
                                        Take Price
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        {formatEther(
                                            BigInt(
                                                marketListing.listing.price || 0
                                            )
                                        )}{' '}
                                        ETH
                                    </p>
                                </div>
                                <div className="bg-black p-4 rounded-lg border border-gray-800 flex-1">
                                    <p className="text-sm text-phyt_text_secondary mb-1">
                                        Highest bid
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        {formatEther(
                                            BigInt(
                                                marketListing.listing
                                                    .highestBid ?? 0
                                            )
                                        )}{' '}
                                        ETH
                                    </p>
                                </div>
                                <div className="bg-black p-4 rounded-lg border border-gray-800 flex-1">
                                    <p className="text-sm text-phyt_text_secondary mb-1">
                                        Last sale
                                    </p>
                                    <p className="text-lg font-bold text-white">
                                        --
                                    </p>
                                </div>
                            </div>

                            {/* Button Rows */}
                            <div className="space-y-2">
                                {/* Buy Now Button (Full Width) */}
                                <Button
                                    onClick={() => {
                                        onBuyNow(marketListing.listing);
                                    }}
                                    disabled={isPurchasing}
                                    className="w-full bg-phyt_blue hover:bg-phyt_blue/80"
                                >
                                    {isPurchasing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Buying...
                                        </>
                                    ) : (
                                        'Buy Now'
                                    )}
                                </Button>

                                {/* Batch Buy and Bid Buttons Row */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            toast({
                                                title: 'Coming Soon',
                                                description:
                                                    'Batch buy functionality will be available soon!'
                                            });
                                        }}
                                        className="border-gray-800 text-white hover:bg-gray-800"
                                    >
                                        Batch Buy
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            toast({
                                                title: 'Coming Soon',
                                                description:
                                                    'Bid functionality will be available soon!'
                                            });
                                        }}
                                        className="border-gray-800 text-white hover:bg-gray-800"
                                    >
                                        Place Bid
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* (2,2) Runner's Stats */}
                    <div className="col-span-1 row-span-1">
                        <div className="bg-gray-800 p-4 rounded-lg space-y-2">
                            <div>
                                <p className="text-sm text-phyt_text_secondary">
                                    Total Distance Ran
                                </p>
                                <p className="text-lg font-bold text-white">
                                    X mi
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-phyt_text_secondary">
                                    Pace
                                </p>
                                <p className="text-lg font-bold text-white">
                                    Y /mi
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-phyt_text_secondary">
                                    Best Time
                                </p>
                                <p className="text-lg font-bold text-white">
                                    Z
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
