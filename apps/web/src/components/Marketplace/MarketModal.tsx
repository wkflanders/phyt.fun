import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';
import { CardRarity, RunnerListing } from '@phyt/types';

interface MarketModalProps {
    listing: RunnerListing | null;
    isOpen: boolean;
    onClose: () => void;
    onBuyNow: (listing: RunnerListing) => void;
    isPurchasing: boolean;
}

const getRarityColor = (rarity: CardRarity) => {
    const colors = {
        bronze: 'text-orange-600',
        silver: 'text-gray-400',
        gold: 'text-yellow-400',
        sapphire: 'text-blue-400',
        ruby: 'text-red-400',
        opal: 'text-purple-400',
    };
    return colors[rarity] || 'text-gray-400';
};

export const MarketModal = ({
    listing,
    isOpen,
    onClose,
    onBuyNow,
    isPurchasing
}: MarketModalProps) => {
    const { toast } = useToast();

    if (!listing) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Card Details"
        >
            <div className="flex flex-col items-center gap-6 p-4">
                {/* Card Image */}
                <Image
                    src={listing.metadata.image_url}
                    alt={`Card ${listing.metadata.runner_name}`}
                    width={200}
                    height={300}
                    className="rounded-lg"
                />

                {/* Card Details */}
                <div className="w-full space-y-4">
                    <div className="bg-phyt_form p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-phyt_text_secondary">Rarity:</span>
                            <span className={getRarityColor(listing.metadata.rarity)}>
                                {listing.metadata.rarity.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-phyt_text_secondary">Take Price:</span>
                            <span className="text-phyt_blue">
                                {formatEther(BigInt(listing.order?.price || 0))} ETH
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-phyt_text_secondary">Highest Offer:</span>
                            <span className="text-phyt_text">
                                {formatEther(BigInt(listing.highest_bid || 0))} ETH
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-phyt_text_secondary">Expires:</span>
                            <span className="text-phyt_text_secondary">
                                {new Date(String(listing.expiration_time)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => onBuyNow(listing)}
                            disabled={isPurchasing}
                            className="flex-1 bg-phyt_blue hover:bg-phyt_blue/80"
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
                        <Button
                            className="flex-1 bg-phyt_form border border-phyt_form_border hover:bg-phyt_form/80"
                            onClick={() => {
                                toast({
                                    title: 'Coming Soon',
                                    description: 'Bidding feature will be available soon!',
                                });
                            }}
                        >
                            Place Bid
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default MarketModal;