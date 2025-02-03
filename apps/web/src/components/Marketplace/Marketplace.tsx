import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/Modal';
import { Clock, ArrowUpDown, DollarSign } from 'lucide-react';
import { useListings, useCreateListing, usePurchaseListing, usePlaceBid } from '@/hooks/use-marketplace';
import type { RunnerListing } from '@phyt/types';

export default function Marketplace() {
    const { address } = useAccount();
    const [showListingModal, setShowListingModal] = useState(false);
    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<RunnerListing | null>(null);
    const [takePrice, setTakePrice] = useState('');
    const [bidAmount, setBidAmount] = useState('');

    const { data: listings, isLoading } = useListings();
    const { mutate: createListing, isPending: isCreating } = useCreateListing();
    const { mutate: purchaseListing, isPending: isPurchasing } = usePurchaseListing();
    const { mutate: placeBid, isPending: isBidding } = usePlaceBid();

    const handleCreateListing = async () => {
        if (!selectedListing || !takePrice) return;

        await createListing({
            cardId: selectedListing.card_id,
            takePrice: parseEther(takePrice)
        });

        setShowListingModal(false);
        setSelectedListing(null);
        setTakePrice('');
    };

    const handlePlaceBid = async () => {
        if (!selectedListing || !bidAmount) return;

        const bidAmountBigInt = parseEther(bidAmount);

        // Validate bid amount is greater than current highest bid
        if (bidAmountBigInt <= selectedListing.highest_bid) {
            toast({
                title: "Invalid bid",
                description: "Bid must be higher than current highest bid",
                variant: "destructive"
            });
            return;
        }

        await placeBid({
            listingId: selectedListing.id,
            cardId: selectedListing.card_id,
            bidAmount: bidAmountBigInt
        });

        setShowBidModal(false);
        setSelectedListing(null);
        setBidAmount('');
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings?.map((listing) => (
                        <Card key={listing.id} className="bg-phyt_form border-phyt_form_border">
                            <CardContent className="p-6">
                                <img
                                    src={listing.metadata.image_url}
                                    alt={listing.metadata.runner_name}
                                    className="w-full aspect-square rounded-lg mb-4"
                                />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-phyt_text">
                                        {listing.metadata.runner_name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="text-phyt_text_secondary">Take Price:</span>
                                        <span className="text-xl font-bold text-phyt_blue">
                                            {formatEther(listing.take_price)} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-phyt_text_secondary">Highest Bid:</span>
                                        <span className="text-lg text-phyt_text">
                                            {listing.highest_bid ? formatEther(listing.highest_bid) : 'No bids'} ETH
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-phyt_text_secondary">Expires in:</span>
                                        <span className="text-phyt_text_secondary">
                                            {formatTimeRemaining(listing.expiration_time)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 bg-black/20 gap-2">
                                {listing.seller_id !== address && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                setSelectedListing(listing);
                                                setShowBidModal(true);
                                            }}
                                            className="flex-1 bg-phyt_form hover:bg-phyt_form_border"
                                            disabled={isBidding}
                                        >
                                            Place Bid
                                        </Button>
                                        <Button
                                            onClick={() => purchaseListing(listing)}
                                            className="flex-1 bg-phyt_blue hover:bg-blue-100 text-black"
                                            disabled={isPurchasing}
                                        >
                                            Buy Now
                                        </Button>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Place Bid Modal */}
            <Modal
                isOpen={showBidModal}
                onClose={() => setShowBidModal(false)}
                title="Place Bid"
            >
                <div className="space-y-4">
                    <div>
                        <Label>Current Highest Bid</Label>
                        <p className="text-xl font-bold text-phyt_text">
                            {selectedListing?.highest_bid
                                ? formatEther(selectedListing.highest_bid)
                                : 'No bids'} ETH
                        </p>
                    </div>

                    <div>
                        <Label>Your Bid (ETH)</Label>
                        <Input
                            type="number"
                            step="0.000001"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <Button
                        onClick={handlePlaceBid}
                        disabled={isBidding || !bidAmount}
                        className="w-full bg-phyt_blue hover:bg-blue-100 text-black"
                    >
                        Place Bid
                    </Button>
                </div>
            </Modal>
        </div>
    );
}