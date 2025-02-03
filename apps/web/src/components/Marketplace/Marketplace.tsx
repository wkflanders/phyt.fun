import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/Modal';
import { useToast } from '@/hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import {
    useListings,
    useCreateListing,
    usePurchaseListing,
    usePlaceBid,
} from '@/hooks/use-marketplace';
import { Loader2, Filter, ArrowUpDown } from 'lucide-react';
import type { CardRarity } from '@phyt/types';

const getRarityColor = (rarity: CardRarity) => {
    const colors: Record<CardRarity, string> = {
        bronze: 'text-orange-600',
        silver: 'text-gray-400',
        gold: 'text-yellow-400',
        sapphire: 'text-blue-400',
        ruby: 'text-red-400',
        opal: 'text-purple-400',
    };
    return colors[rarity];
};

const getStatBar = (value: number) => {
    const percentage = (value / 100) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2">
            <div
                className="bg-phyt_blue h-full rounded-full"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

export default function Marketplace() {
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('price');
    const [filterRarity, setFilterRarity] = useState('all');

    // State for bidding modal
    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [bidAmount, setBidAmount] = useState('');

    const { toast } = useToast();
    const { address } = useAccount();
    const { ready } = usePrivy();

    // Fetch listings with sorting & filtering
    const { data: listings = [], isLoading: isLoadingListings } = useListings({
        sort:
            sortBy === 'price'
                ? 'price_asc'
                : sortBy === 'price-desc'
                    ? 'price_desc'
                    : 'created_at',
        rarity: filterRarity !== 'all' ? [filterRarity] : undefined,
    });

    const { mutate: placeBid, isPending: isBidding } = usePlaceBid();
    const { mutate: purchaseListing, isPending: isPurchasing } = usePurchaseListing();

    /**
     * Handle user placing a bid in the modal
     */
    const handlePlaceBid = async () => {
        if (!selectedListing || !bidAmount) return;

        try {
            const bidAmountBigInt = parseEther(bidAmount);

            // Example check: must exceed the current highest bid
            if (
                selectedListing.highest_bid &&
                bidAmountBigInt <= selectedListing.highest_bid
            ) {
                toast({
                    title: 'Invalid bid',
                    description: 'Bid must be higher than the current highest bid.',
                    variant: 'destructive',
                });
                return;
            }

            // Place bid via our marketplace hook
            placeBid({
                listingId: selectedListing.id,
                cardId: selectedListing.card_id,
                bidAmount: bidAmountBigInt,
            });

            // Close the modal after placing the bid
            setShowBidModal(false);
            setSelectedListing(null);
            setBidAmount('');
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: 'Failed to place bid. Please try again.',
                variant: 'destructive',
            });
        }
    };

    /**
     * Handle purchasing the card at the seller’s take price
     */
    const handleBuyNow = (listing: any) => {
        if (!listing) return;

        purchaseListing(listing);
    };

    // Example function: if the listing is expired, you might conditionally disable bidding or buying
    const isListingExpired = (listing: any) => {
        if (!listing.expiration) return false;
        const now = Date.now();
        const expirationTimestamp = new Date(listing.expiration).getTime();
        return now > expirationTimestamp;
    };

    return (
        <div className="w-full">
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="text-phyt_text_secondary" size={20} />
                        <select
                            className="bg-phyt_form text-phyt_text border border-phyt_form_border rounded-md p-2"
                            value={filterRarity}
                            onChange={(e) => setFilterRarity(e.target.value)}
                        >
                            <option value="all">All Rarities</option>
                            <option value="bronze">Bronze</option>
                            <option value="silver">Silver</option>
                            <option value="gold">Gold</option>
                            <option value="sapphire">Sapphire</option>
                            <option value="ruby">Ruby</option>
                            <option value="opal">Opal</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ArrowUpDown className="text-phyt_text_secondary" size={20} />
                    <select
                        className="bg-phyt_form text-phyt_text border border-phyt_form_border rounded-md p-2"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="price">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="created_at">Recently Listed</option>
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoadingListings ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-phyt_text_secondary">
                        No listings found
                    </div>
                ) : (
                    listings.map((listing: any) => {
                        const buyNowPrice = listing.order?.price || 0n;
                        const highestBid = listing.highest_bid || 0n;
                        const expired = isListingExpired(listing);

                        return (
                            <Card
                                key={listing.id}
                                className="bg-phyt_form border-phyt_form_border overflow-hidden"
                            >
                                <CardContent className="p-4">
                                    {/* Image & Rarity Badge */}
                                    <div className="aspect-square relative mb-4">
                                        <img
                                            src={listing.metadata.image_url}
                                            alt={listing.metadata.runner_name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <span
                                            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-semibold ${getRarityColor(
                                                listing.metadata.rarity
                                            )} bg-black/50`}
                                        >
                                            {listing.metadata.rarity}
                                        </span>
                                    </div>

                                    {/* Runner Name */}
                                    <h3 className="text-lg font-bold text-phyt_text mb-2">
                                        {listing.metadata.runner_name}
                                    </h3>

                                    {/* Price & Multipliers */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-phyt_text_secondary">Buy Now</span>
                                            <span className="text-xl font-bold text-phyt_blue">
                                                {formatEther(buyNowPrice)} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-phyt_text_secondary">
                                                Current Bid
                                            </span>
                                            <span className="text-lg text-phyt_text">
                                                {formatEther(BigInt(highestBid))} ETH
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-phyt_text_secondary">Multiplier</span>
                                            <span className="text-lg text-phyt_text">
                                                {listing.metadata.multiplier}x
                                            </span>
                                        </div>
                                        {listing.expiration && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-phyt_text_secondary">
                                                    Expires:
                                                </span>
                                                <span className="text-sm text-phyt_text_secondary">
                                                    {new Date(listing.expiration).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-4 bg-black/20">
                                    <div className="flex items-center justify-between w-full gap-2">
                                        {/* Place Bid */}
                                        <Button
                                            onClick={() => {
                                                setSelectedListing(listing);
                                                setShowBidModal(true);
                                            }}
                                            className="flex-1 bg-phyt_form hover:bg-phyt_form/80 text-phyt_text"
                                            disabled={expired || isBidding}
                                        >
                                            {isBidding && selectedListing?.id === listing.id
                                                ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                )
                                                : null}
                                            Place Bid
                                        </Button>

                                        {/* Buy Now */}
                                        <Button
                                            onClick={() => handleBuyNow(listing)}
                                            className="flex-1 bg-phyt_blue hover:bg-phyt_blue/90 text-white"
                                            disabled={expired || isPurchasing}
                                        >
                                            {isPurchasing && selectedListing?.id === listing.id
                                                ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                )
                                                : null}
                                            Buy Now
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Bid Modal */}
            <Modal
                isOpen={showBidModal}
                onClose={() => {
                    setShowBidModal(false);
                    setSelectedListing(null);
                    setBidAmount('');
                }}
                title="Place a Bid"
            >
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4 text-phyt_text">
                        Place a Bid
                    </h2>
                    {selectedListing && (
                        <div className="mb-4">
                            <div className="mb-2 flex justify-between">
                                <span className="text-phyt_text_secondary">Item:</span>
                                <span>{selectedListing.metadata.runner_name}</span>
                            </div>
                            <div className="mb-2 flex justify-between">
                                <span className="text-phyt_text_secondary">Current Bid:</span>
                                <span>
                                    {formatEther(BigInt(selectedListing?.highest_bid || 0n))} ETH
                                </span>
                            </div>
                        </div>
                    )}
                    <Label htmlFor="bid-amount" className="text-phyt_text_secondary">
                        Your Bid (ETH)
                    </Label>
                    <Input
                        id="bid-amount"
                        className="mb-4"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="0.05"
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowBidModal(false);
                                setSelectedListing(null);
                                setBidAmount('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePlaceBid} disabled={isBidding}>
                            {isBidding ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Submit Bid
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
