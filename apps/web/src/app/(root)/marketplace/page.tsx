'use client';

import React from 'react';

import Marketplace from '@/components/marketplace/Marketplace';

export default function MarketplacePage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <Marketplace />
            </div>
        </div>
    );
}
