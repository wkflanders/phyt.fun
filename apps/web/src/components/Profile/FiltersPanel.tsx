import React from 'react';
import { Button } from '@/components/ui/button';

export const FiltersPanel: React.FC = () => {
    return (
        <div className="border border-border bg-card rounded-xl p-4 mb-6">
            <h3 className="font-medium mb-4">Filters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <h4 className="text-sm text-text-dim mb-2">Status</h4>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input type="checkbox" id="buy-now" className="mr-2" />
                            <label htmlFor="buy-now" className="text-sm">Buy Now</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="on-auction" className="mr-2" />
                            <label htmlFor="on-auction" className="text-sm">On Auction</label>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm text-text-dim mb-2">Price</h4>
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Min" className="w-full bg-form border border-border rounded p-2 text-sm" />
                        <span>to</span>
                        <input type="text" placeholder="Max" className="w-full bg-form border border-border rounded p-2 text-sm" />
                    </div>
                </div>
                <div>
                    <h4 className="text-sm text-text-dim mb-2">Collections</h4>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input type="checkbox" id="collection-1" className="mr-2" />
                            <label htmlFor="collection-1" className="text-sm">HYTOPIA Worlds</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="collection-2" className="mr-2" />
                            <label htmlFor="collection-2" className="text-sm">Pixels - Farm Land</label>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm text-text-dim mb-2">Chains</h4>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input type="checkbox" id="ethereum" className="mr-2" />
                            <label htmlFor="ethereum" className="text-sm">Ethereum</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="base" className="mr-2" />
                            <label htmlFor="base" className="text-sm">Base</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <Button variant="outline" className="mr-2">Clear All</Button>
                <Button>Apply</Button>
            </div>
        </div>
    );
};