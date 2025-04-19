import { Listing, MarketListing } from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { Loader2, Filter, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useListings, usePurchaseListing } from '@/hooks/use-marketplace';
import { useToast } from '@/hooks/use-toast';


import { MarketModal } from './MarketModal';



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
        <div className="flex flex-col space-y-8 mx-auto lg:mx-0 w-5/6 lg:w-auto">
            {/* Filter Bar */}
            <Card className="border-0">
                <CardContent className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-0">
                            <Filter className="text-phyt_text" size={20} />
                            <Select value={filterRarity} onValueChange={(value) => { setFilterRarity(value as RarityFilter); }}>
                                <SelectTrigger className="bg-transparent text-md text-phyt_text border-0">
                                    <SelectValue placeholder="All Rarities" />
                                </SelectTrigger>
                                <SelectContent className="border-0">
                                    <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="all">All Rarities</SelectItem>
                                    <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="bronze">Bronze</SelectItem>
                                    <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="silver">Silver</SelectItem>
                                    <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="gold">Gold</SelectItem>
                                    <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="ruby">Ruby</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="text-phyt_text" size={20} />
                        <Select value={sortBy} onValueChange={(value) => { setSortBy(value as SortOption); }}>
                            <SelectTrigger className="bg-transparent text-md text-phyt_text border-0">
                                <SelectValue className="text-lg" placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent className="border-0">
                                <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="created_at">Recently Listed</SelectItem>
                                <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="price_asc">Price: Low to High</SelectItem>
                                <SelectItem className="text-phyt_text focus:text-phyt_text focus:text-opacity-50 focus:cursor-pointer" value="price_desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {marketListings.length === 0 ? (
                    <div className="col-span-full text-center text-lg text-phyt_text text-opacity-50 py-12">
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
                onClose={() => { setSelectedListing(null); }}
                onBuyNow={handleBuyNow}
                isPurchasing={isPurchasing}
            />
        </div >
    );
};

export default Marketplace;