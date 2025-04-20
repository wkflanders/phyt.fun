import { CardWithMetadata, Listing, User } from '@phyt/types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';
import React, { useState } from 'react';
import { parseEther } from 'viem';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    useCreateListing,
    useListings,
    usePurchaseListing
} from '@/hooks/use-marketplace';
import { useToast } from '@/hooks/use-toast';

interface SellModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    card: CardWithMetadata;
}

interface OrderBookEntry {
    price: number;
    quantity: number;
}

interface ExpirationOption {
    value: string;
    label: string;
}

const expirationOptions: ExpirationOption[] = [
    { value: '1', label: '1 Hour' },
    { value: '3', label: '3 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '1 Day' },
    { value: '72', label: '3 Days' },
    { value: '168', label: '7 Days' }
];

export const SellModal = ({ user, isOpen, onClose, card }: SellModalProps) => {
    const [listingPrice, setListingPrice] = useState('');
    const [expirationHours, setExpirationHours] = useState('24');
    const createListing = useCreateListing(user);
    const purchaseListing = usePurchaseListing();
    const { toast } = useToast();
    const { data: marketListings = [], isLoading: isLoadingListings } =
        useListings({ sort: 'price_asc' });

    const cardListings = marketListings.filter(
        (marketListing) =>
            marketListing.metadata.runner_id === card.metadata.runner_id &&
            marketListing.metadata.rarity === card.metadata.rarity
    );

    const orderBook: OrderBookEntry[] = cardListings
        .reduce((acc: OrderBookEntry[], listing) => {
            const price = Number(listing.listing.price);
            const existingEntry = acc.find((entry) => entry.price === price);

            if (existingEntry) {
                existingEntry.quantity += 1;
            } else {
                acc.push({ price: price, quantity: 1 });
            }

            return acc;
        }, [])
        .sort((a, b) => b.price - a.price);

    const sortedHighestListings = [...cardListings].sort((a, b) =>
        Number(BigInt(b.listing.price || 0) - BigInt(a.listing.price || 0))
    );
    const highestBid =
        sortedHighestListings.length > 0
            ? BigInt(sortedHighestListings[0].listing.price)
            : 0n;
    const highestListing =
        highestBid && highestBid !== 0n ? cardListings[0].listing : null;

    const handleCreateListing = async () => {
        if (card.owner_id !== user.id) {
            toast({
                title: 'Error',
                description: 'You do not own this card',
                variant: 'destructive'
            });
            return;
        }

        const parsedListingPrice = parseEther(listingPrice);
        if (parsedListingPrice >= highestBid && highestListing) {
            await handleAcceptHighestBid(highestListing);
            return;
        }

        try {
            const expiration = new Date();
            expiration.setHours(
                expiration.getHours() + parseInt(expirationHours)
            );

            await createListing.mutateAsync({
                cardId: card.id,
                tokenId: card.token_id,
                takePrice: parsedListingPrice,
                expiration: expiration.toISOString()
            });

            onClose();
            setListingPrice('');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create listing',
                variant: 'destructive'
            });
        }
    };

    const handleAcceptHighestBid = async (listing: Listing) => {
        if (!highestBid) return;

        try {
            const expiration = new Date();
            expiration.setMinutes(expiration.getMinutes() + 5);

            await purchaseListing.mutateAsync(listing);

            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to execute instant sell',
                variant: 'destructive'
            });
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="bg-phyt_bg w-full max-w-md">
                <VisuallyHidden>
                    <DialogTitle></DialogTitle>
                    <DialogDescription></DialogDescription>
                </VisuallyHidden>
                {/* Card Image */}
                <div className="flex justify-center">
                    <Image
                        src={card.metadata.image_url}
                        alt={`Card ${String(card.metadata.token_id)}`}
                        width={100}
                        height={150}
                        className="rounded-lg"
                    />
                </div>

                {/* Order Book */}
                <div className="bg-black p-4 rounded-lg border border-gray-800">
                    <table className="w-full text-sm text-white">
                        <thead>
                            <tr className="text-phyt_text_secondary border-b border-gray-800">
                                <th className="text-left py-2">Price (ETH)</th>
                                <th className="text-right py-2">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderBook.length > 0
                                ? orderBook.map((order, index) => (
                                      <tr
                                          key={index}
                                          className={`
                            ${index % 2 === 0 ? 'bg-black' : 'bg-gray-900'}
                            hover:bg-gray-800
                        `}
                                      >
                                          <td className="py-2">
                                              {order.price}
                                          </td>
                                          <td className="text-right py-2">
                                              {order.quantity}
                                          </td>
                                      </tr>
                                  ))
                                : // Empty state - 4 blank rows
                                  Array.from({ length: 4 }).map((_, index) => (
                                      <tr
                                          key={index}
                                          className={`
                            ${index % 2 === 0 ? 'bg-black' : 'bg-gray-900'}
                        `}
                                      >
                                          <td className="py-2">&nbsp;</td>
                                          <td className="py-2">&nbsp;</td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>

                {/* Listing Controls */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Input
                            type="number"
                            placeholder="Price (ETH)"
                            className="border-gray-800"
                            value={listingPrice}
                            onChange={(e) => {
                                setListingPrice(e.target.value);
                            }}
                        />
                        <Select
                            value={expirationHours}
                            onValueChange={setExpirationHours}
                        >
                            <SelectTrigger className="border-gray-800 text-white">
                                <SelectValue placeholder="Expiration" />
                            </SelectTrigger>
                            <SelectContent>
                                {expirationOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="bg-phyt_blue hover:bg-phyt_blue/80"
                            onClick={handleCreateListing}
                        >
                            List
                        </Button>
                    </div>

                    <Button className="w-full border-gray-800 hover:bg-gray-800">
                        Accept Highest Bid (0.005 ETH)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
