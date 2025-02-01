'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Filter, ArrowUpDown } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

// Mock data - replace with actual API calls
const mockListings = [
    {
        id: 1,
        name: "Speed Runner #1",
        rarity: "Common",
        price: "0.05",
        image: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        stats: {
            speed: 75,
            endurance: 80,
            power: 65
        }
    },
    {
        id: 2,
        name: "Elite Runner #42",
        rarity: "Rare",
        price: "0.15",
        image: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        stats: {
            speed: 85,
            endurance: 90,
            power: 88
        }
    },
    {
        id: 3,
        name: "Speed Runner #3",
        rarity: "Common",
        price: "0.05",
        image: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        stats: {
            speed: 75,
            endurance: 80,
            power: 65
        }
    },
    {
        id: 4,
        name: "Elite Runner #100",
        rarity: "Rare",
        price: "0.15",
        image: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        stats: {
            speed: 85,
            endurance: 90,
            power: 88
        }
    },
];

const MarketplaceListing = () => {
    const [listings, setListings] = useState(mockListings);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('price');
    const [filterRarity, setFilterRarity] = useState('all');
    const { toast } = useToast();
    const { address } = useAccount();
    const { ready } = usePrivy();

    const handlePurchase = async (listingId: number) => {
        if (!address) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Add contract interaction here
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
            toast({
                title: "Success",
                description: "NFT purchased successfully!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to purchase NFT",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'common': return 'text-gray-400';
            case 'rare': return 'text-blue-400';
            case 'exotic': return 'text-purple-400';
            case 'legendary': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getStatBar = (value: number) => {
        return (
            <div className="w-full bg-phyt_form rounded-full h-2">
                <div
                    className="bg-phyt_blue h-full rounded-full"
                    style={{ width: `${value}%` }}
                />
            </div>
        );
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
                            <option value="common">Common</option>
                            <option value="rare">Rare</option>
                            <option value="exotic">Exotic</option>
                            <option value="legendary">Legendary</option>
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
                        <option value="rarity">Rarity</option>
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                    <Card key={listing.id} className="bg-phyt_form border-phyt_form_border overflow-hidden">
                        <CardContent className="p-4">
                            <div className="aspect-square relative mb-4">
                                <img
                                    src={listing.image}
                                    alt={listing.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-sm font-semibold ${getRarityColor(listing.rarity)} bg-black/50`}>
                                    {listing.rarity}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-phyt_text mb-2">{listing.name}</h3>

                            <div className="space-y-2 mb-4">
                                <div>
                                    <p className="text-sm text-phyt_text_secondary mb-1">Speed</p>
                                    {getStatBar(listing.stats.speed)}
                                </div>
                                <div>
                                    <p className="text-sm text-phyt_text_secondary mb-1">Endurance</p>
                                    {getStatBar(listing.stats.endurance)}
                                </div>
                                <div>
                                    <p className="text-sm text-phyt_text_secondary mb-1">Power</p>
                                    {getStatBar(listing.stats.power)}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 bg-black/20">
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <p className="text-sm text-phyt_text_secondary">Price</p>
                                    <p className="text-xl font-bold text-phyt_blue">{listing.price} ETH</p>
                                </div>
                                <Button
                                    onClick={() => handlePurchase(listing.id)}
                                    disabled={isLoading || !ready}
                                    className="bg-phyt_blue hover:bg-blue-100 text-black"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Buy Now'
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MarketplaceListing;