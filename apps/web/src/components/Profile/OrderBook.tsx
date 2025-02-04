import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { formatEther, parseEther } from 'viem';
import Image from 'next/image';
import { useCreateListing, useListings } from '@/hooks/use-marketplace';
import { useToast } from '@/hooks/use-toast';
import { User } from '@phyt/types';
import { CardResponse } from './Inventory';

const EXPIRATION_OPTIONS = [
    { value: '1', label: '1 Hour' },
    { value: '3', label: '3 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '1 Day' },
    { value: '72', label: '3 Days' },
    { value: '168', label: '7 Days' },
];

export const OrderBookModal = ({
    user,
    card,
    isOpen,
    onClose
}: {
    user: User,
    card: CardResponse;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const [listingPrice, setListingPrice] = useState('');
    const [expirationHours, setExpirationHours] = useState('24');
    const { toast } = useToast();
    const createListing = useCreateListing(user);

    // Fetch current listings for this card
    const { data: listings = [], isLoading: isLoadingListings } = useListings({
        sort: 'price_desc'
    });

    // Filter listings for this specific card
    const cardListings = listings.filter(l => l.order && l.order.token_id === card?.tokenId) || [];
    const highestBuyOffer = cardListings.length > 0 && cardListings[0].order?.price !== undefined
        ? BigInt(cardListings[0].order.price)
        : 0n;

    const handleCreateListing = async () => {
        console.log(card.ownerId);
        console.log(user.id);
        if (card.ownerId !== user.id) {
            toast({
                title: "Error",
                description: "You do not own this card",
                variant: "destructive"
            });
            return;
        }
        try {
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + parseInt(expirationHours));

            await createListing.mutateAsync({
                cardId: card.id,
                tokenId: card.tokenId,
                takePrice: parseEther(listingPrice),
                expiration: expiration.toISOString()
            });

            onClose();
            setListingPrice('');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create listing",
                variant: "destructive"
            });
        }
    };

    const handleInstantSell = async () => {
        if (!highestBuyOffer) return;
        try {
            const expiration = new Date();
            expiration.setMinutes(expiration.getMinutes() + 5); // 5 min expiration for instant sell

            await createListing.mutateAsync({
                cardId: card.id,
                tokenId: card.tokenId,
                takePrice: BigInt(highestBuyOffer),
                expiration: expiration.toISOString()
            });

            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to execute instant sell",
                variant: "destructive"
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="List Card for Sale">
            <div className="flex flex-col items-center gap-6 p-4">
                {/* Card Image */}
                <Image
                    src={card?.imageUrl || ''}
                    alt={`Card ${card?.tokenId}`}
                    width={200}
                    height={300}
                    className="rounded-lg"
                />

                {/* Order Book */}
                <div className="w-full bg-phyt_form p-4 rounded-lg">
                    <div className="text-phyt_text mb-2">
                        Total Listings: {cardListings.length}
                    </div>
                    <div className="space-y-2">
                        {isLoadingListings ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-phyt_blue" />
                            </div>
                        ) : (
                            cardListings.map((listing, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between text-phyt_text_secondary"
                                >
                                    <span>{formatEther(BigInt(listing.order.price))} ETH</span>
                                    <span>x{1}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Listing Controls */}
                <div className="w-full space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-phyt_text_secondary">Price (ETH)</label>
                            <Input
                                type="number"
                                step="0.001"
                                value={listingPrice}
                                onChange={(e) => setListingPrice(e.target.value)}
                                placeholder="0.05"
                                className="bg-phyt_form border-phyt_form_border text-phyt_text mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-phyt_text_secondary">Expiration</label>
                            <select
                                value={expirationHours}
                                onChange={(e) => setExpirationHours(e.target.value)}
                                className="w-full mt-1 bg-phyt_form border border-phyt_form_border rounded-md p-2 text-phyt_text"
                            >
                                {EXPIRATION_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <Button
                        onClick={handleCreateListing}
                        disabled={createListing.isPending}
                        className="w-full bg-phyt_blue hover:bg-blue-100 text-black"
                    >
                        {createListing.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Create Listing
                    </Button>

                    {highestBuyOffer > 0n && (
                        <Button
                            onClick={handleInstantSell}
                            disabled={createListing.isPending}
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                            {createListing.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Sell Now for {formatEther(highestBuyOffer)} ETH
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};