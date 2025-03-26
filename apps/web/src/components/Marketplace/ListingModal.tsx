import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { CardWithMetadata, OrderBookEntry, ListingModalProps, ExpirationOption, User } from "@phyt/types";
import { useCreateListing, useListings } from "@/hooks/use-marketplace";
import { useGetRunnerStanding } from '@/hooks/use-leaderboard';
import { parseEther } from 'viem';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { formatSeasonName } from '@/lib/utils';
import { useGetRunner } from '@/hooks/use-runners';

export const expirationOptions: ExpirationOption[] = [
    { value: '1', label: '1 Hour' },
    { value: '3', label: '3 Hours' },
    { value: '6', label: '6 Hours' },
    { value: '12', label: '12 Hours' },
    { value: '24', label: '1 Day' },
    { value: '72', label: '3 Days' },
    { value: '168', label: '7 Days' },
];

const DEFAULT_AVATAR = 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export const ListingModal = ({ user, isOpen, onClose, card }: ListingModalProps) => {
    const [listingPrice, setListingPrice] = useState('');
    const [expirationHours, setExpirationHours] = useState('24');
    const createListing = useCreateListing(user);
    const { toast } = useToast();
    const { data: marketListings = [], isLoading: isLoadingListings } = useListings({ sort: 'price_asc' });
    const { data: runnerStanding, isLoading: isLoadingRunnerStanding } = useGetRunnerStanding(card.metadata.runner_id, { timeFrame: 'allTime' });
    const { data: runner } = useGetRunner(card.metadata.runner_id);

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
            <DialogContent className="bg-zinc-900/60 backdrop-blur-xl w-full h-full max-w-[90vw] max-h-[95vh] overflow-hidden p-12">
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left Column - Card Image */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-full max-h-[calc(100vh-200px)] aspect-[2/3]">
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
                        {/* Header Section */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-dim">{formatSeasonName(card.metadata.season)}</span>
                            </div>
                            <h1 className="text-3xl font-bold">{`${card.metadata.runner_name} #${card.metadata.token_id}`}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-text-dim">Opened on</span>
                                <span className="text-sm font-medium">{new Date(card.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Runner Info Section */}
                            <div className="flex items-center justify-between py-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <a href={`/page/${runner?.runner_wallet}`} className="flex items-center gap-2 ">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden hover:text-text-dim hover:cursor-pointer">
                                            <Image
                                                src={runner?.avatar_url || DEFAULT_AVATAR}
                                                alt={user.username}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="font-medium">{user.username}</div>
                                        </div>
                                    </a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a
                                        href={`https://twitter.com/${user.twitter_handle || ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-text-dim hover:text-text transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a
                                        href={`https://strava.com/athletes/${user.strava_handle || ''}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-text-dim hover:text-text transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Market Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 py-4">
                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">TOP OFFER</div>
                                <div className="font-medium">{highestBid ? `${highestBid} ETH` : '--'}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">PRICE</div>
                                <div className="font-medium">
                                    {orderBook.length > 0 ? `${orderBook[orderBook.length - 1].price} ETH` : '--'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">LAST SALE</div>
                                <div className="font-medium">--</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-4 pb-8 border-b border-white/10">
                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">RARITY</div>
                                <div className="font-medium">
                                    {card.metadata.rarity ? card.metadata.rarity.charAt(0).toUpperCase() + card.metadata.rarity.slice(1) : '--'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">TOKEN ID</div>
                                <div className="font-medium">{card.metadata.token_id}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-sm text-text-dim">RANKING</div>
                                <div className="font-medium">{runnerStanding?.ranking}</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 border-b border-white/10 pb-8">
                            <Button
                                onClick={handleCreateListing}
                                disabled={createListing.isPending}
                                className="flex-1 bg-secondary py-6 hover:bg-secondary-shade"
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