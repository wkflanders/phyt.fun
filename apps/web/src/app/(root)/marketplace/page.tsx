'use client';

import React from 'react';
import Marketplace from '@/components/Marketplace/Marketplace';

export default function MarketplacePage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Marketplace />
            </div>
        </div>
    );
}