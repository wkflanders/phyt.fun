import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { CardWithMetadata, User } from "@phyt/types";
import { useCreateListing, useListings } from "@/hooks/use-marketplace";
import { parseEther } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ListingModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    card: CardWithMetadata;
}

interface ExpirationOption {
    value: string;
    label: string;
}

interface OrderBookEntry {
    price: number;
    quantity: number;
}

const expirationOptions: ExpirationOption[] = [
    { value: '1', label: '1 Hour' },
    { value: '3', label: '3 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '1 Day' },
    { value: '72', label: '3 Days' },
    { value: '168', label: '7 Days' },
];

export const ListingModal = ({ user, isOpen, onClose, card }: ListingModalProps) => {
    const [listingPrice, setListingPrice] = useState('');
    const [expirationHours, setExpirationHours] = useState('24');
    const createListing = useCreateListing(user);
    const { toast } = useToast();
    const { data: marketListings = [], isLoading: isLoadingListings } = useListings({ sort: 'price_asc' });

    const cardListings = marketListings.filter((marketListing) =>
        marketListing.metadata.runner_id === card.metadata.runner_id &&
        marketListing.metadata.rarity === card.metadata.rarity
    );

    const orderBook: OrderBookEntry[] = cardListings.reduce((acc: OrderBookEntry[], listing) => {
        const price = Number(listing.listing.price);
        const existingEntry = acc.find(entry => entry.price === price);

        if (existingEntry) {
            existingEntry.quantity += 1;
        } else {
            acc.push({ price: price, quantity: 1 });
        }

        return acc;
    }, []).sort((a, b) => b.price - a.price);

    const sortedHighestListings = [...cardListings].sort((a, b) =>
        Number(BigInt(b.listing.price || 0) - BigInt(a.listing.price || 0))
    );
    const highestBid = sortedHighestListings.length > 0 && sortedHighestListings[0].listing.price !== undefined
        ? BigInt(sortedHighestListings[0].listing.price)
        : 0n;

    const handleCreateListing = async () => {
        if (!listingPrice) {
            toast({
                title: "Error",
                description: "Please enter a listing price",
                variant: "destructive",
            });
            return;
        }

        try {
            const price = parseEther(listingPrice);
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + parseInt(expirationHours));

            await createListing.mutateAsync({
                cardId: card.id,
                tokenId: card.metadata.token_id,
                takePrice: price,
                expiration: expiration.toISOString(),
            });

            onClose();
        } catch (error) {
            console.error('Error creating listing:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-zinc-900/60 backdrop-blur-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Card Image */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full max-h-[calc(90vh-200px)] aspect-[2/3]">
                            <Image
                                src={card.metadata.image_url}
                                alt={card.metadata.runner_name}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Right Column - Card Info and Actions */}
                    <div className="space-y-6">
                        {/* Card Name */}
                        <div>
                            <h3 className="text-2xl font-bold">{card.metadata.runner_name}</h3>
                            <p className="text-text-dim">{card.metadata.season}</p>
                        </div>

                        {/* Market Data Table */}
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Top Offer</TableCell>
                                    <TableCell className="text-right">
                                        {highestBid ? `${highestBid} ETH` : '--'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Floor</TableCell>
                                    <TableCell className="text-right">
                                        {orderBook.length > 0
                                            ? `${orderBook[orderBook.length - 1].price} ETH`
                                            : '--'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Token ID</TableCell>
                                    <TableCell className="text-right">{card.metadata.token_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Last Sale</TableCell>
                                    <TableCell className="text-right">--</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Leaderboard Rank</TableCell>
                                    <TableCell className="text-right">--</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateListing}
                                disabled={createListing.isPending}
                                className="flex-1"
                            >
                                {createListing.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Listing...
                                    </>
                                ) : (
                                    'Create Listing'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 