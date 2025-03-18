import React from 'react';
import { Packs } from '@/components/Packs/Packs';

export default function PackPage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Packs />
            </div>
        </div>
    );
}