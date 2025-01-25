import React from 'react';
import PackPurchase from '@/components/Packs/PackPurchase';

export default function PackPage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-phyt_text">Runner Packs</h1>
                </div>

                <PackPurchase />
            </div>
        </div>
    );
}