import React, { useState } from 'react';
import Image from 'next/image';
import { useListings, usePurchaseListing } from '@/hooks/use-marketplace';
import { useToast } from '@/hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { Loader2, Filter, ArrowUpDown } from 'lucide-react';
import { MarketModal } from './MarketModal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Listing, MarketListing } from '@phyt/types';
import { formatEther } from 'viem';

type SortOption = 'created_at' | 'price_asc' | 'price_desc';
type RarityFilter = 'all' | 'bronze' | 'silver' | 'gold' | 'sapphire' | 'ruby' | 'opal';

const Marketplace = () => {
    const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('created_at');
    const [filterRarity, setFilterRarity] = useState<RarityFilter>('all');

    const { toast } = useToast();
    const { address } = useAccount();
    const { ready } = usePrivy();

    const { data: marketListings = [], isLoading } = useListings({
        sort: sortBy,
        rarity: filterRarity !== 'all' ? [filterRarity] : undefined,
    });
    const { mutate: purchaseListing, isPending: isPurchasing } = usePurchaseListing();

    const handleBuyNow = (listing: Listing) => {
        if (!ready || !address) {
            toast({
                title: 'Error',
                description: 'Please connect your wallet first',
                variant: 'destructive',
            });
            return;
        }

        purchaseListing(listing, {
            onSuccess: () => {
                setSelectedListing(null);
                toast({
                    title: 'Success',
                    description: 'Purchase completed successfully!',
                });
            },
            onError: (error) => {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to purchase',
                    variant: 'destructive',
                });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8">
            {/* Filter Bar */}
            <Card className=" border-phyt_form">
                <CardContent className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="text-phyt_text_secondary" size={20} />
                            <select
                                className="bg-phyt_form text-phyt_text border border-phyt_form_border rounded-md p-2"
                                value={filterRarity}
                                onChange={(e) => setFilterRarity(e.target.value as RarityFilter)}
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
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="created_at">Recently Listed</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {marketListings.length === 0 ? (
                    <div className="col-span-full text-center text-phyt_text_secondary py-12">
                        No listings found
                    </div>
                ) : (
                    marketListings.map((marketListing: MarketListing) => (
                        <Card
                            key={marketListing.listing.id}
                            onClick={() => {
                                setSelectedListing(marketListing);
                            }}
                            className="cursor-pointer border-0 shadow-0 bg-transparent w-[200px]"
                        >
                            <CardContent className="p-0">
                                <div className="relative w-[200px] h-[300px]">
                                    <Image
                                        src={marketListing.metadata.image_url}
                                        alt={`Card ${marketListing.metadata.runner_name}`}
                                        fill
                                        className="object-contain hover:scale-105 transition-transform duration-200"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-2 bg-phyt_form bg-opacity-20 p-4">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-phyt_text_secondary text-sm">Buy Now</span>
                                    <span className="text-phyt_text">
                                        {formatEther(BigInt(marketListing.listing.price || 0))} ETH
                                    </span>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-phyt_text_secondary text-sm">Highest Bid</span>
                                    <span className="text-phyt_text_secondary">
                                        {formatEther(BigInt(marketListing.listing.highest_bid || 0))} ETH
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <MarketModal
                marketListing={selectedListing}
                isOpen={!!selectedListing}
                onClose={() => setSelectedListing(null)}
                onBuyNow={handleBuyNow}
                isPurchasing={isPurchasing}
            />
        </div>
    );
};

export default Marketplace;