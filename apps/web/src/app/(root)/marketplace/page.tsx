import React from 'react';
import MarketplaceListing from '@/components/Marketplace/MarketplaceListing';

export default function MarketplacePage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-phyt_text mb-4">NFT Marketplace</h1>
                </div>

                <MarketplaceListing />
            </div>
        </div>
    );
}