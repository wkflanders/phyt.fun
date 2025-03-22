import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Collection {
    name: string;
    verified: boolean;
    items: number;
    value: string;
}

interface CollectionsSidebarProps {
    collections: Collection[];
}

export const CollectionsSidebar: React.FC<CollectionsSidebarProps> = ({
    collections = []
}) => {
    const [activeTab, setActiveTab] = useState<'collections' | 'tokens'>('collections');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCollections = collections.filter(
        collection => collection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-96 bg-card/50 rounded-xl p-4 mr-6 h-fit">
            <div className="flex items-center p-2">
                <div className="rounded-full bg-primary-faded p-1 mr-3">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="text-sm font-medium">NET WORTH</span>
            </div>

            <div className="mt-2 px-2">
                <div className="text-3xl font-bold">4.9028 ETH</div>
                <div className="text-text-dim text-sm">$9,702.63</div>
            </div>

            <div className="flex mt-4 px-2">
                <div className="mr-4">
                    <div className="text-text-dim text-xs">NFTS</div>
                    <div className="font-medium">30%</div>
                </div>
                <div>
                    <div className="text-text-dim text-xs">TOKENS</div>
                    <div className="font-medium">70%</div>
                </div>
            </div>

            {/* Tab buttons */}
            <div className="flex border-b border-border mt-6">
                <button
                    className={cn(
                        "flex-1 py-2 text-sm font-medium",
                        activeTab === 'collections'
                            ? "border-b-2 border-text text-text"
                            : "text-text-dim"
                    )}
                    onClick={() => setActiveTab('collections')}
                >
                    Collections
                </button>
                <button
                    className={cn(
                        "flex-1 py-2 text-sm font-medium",
                        activeTab === 'tokens'
                            ? "border-b-2 border-text text-text"
                            : "text-text-dim"
                    )}
                    onClick={() => setActiveTab('tokens')}
                >
                    Tokens
                </button>
            </div>

            {/* Search bar */}
            <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dim h-4 w-4" />
                <input
                    type="text"
                    placeholder={activeTab === 'collections' ? "Search for collections" : "Search for tokens"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-form border border-border rounded-lg py-2 pl-10 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Collection table */}
            {activeTab === 'collections' && (
                <div className="mt-4">
                    <div className="flex items-center py-2 text-xs text-text-dim border-b border-border">
                        <div className="w-6"></div>
                        <div className="flex-1">COLLECTION</div>
                        <div className="w-12 text-right">HELD</div>
                        <div className="w-28 text-right">VALUE</div>
                    </div>

                    {filteredCollections.map((collection, index) => (
                        <div key={index} className="flex items-center py-3 border-b border-border/50">
                            <div className="w-6">
                                <input type="checkbox" className="h-4 w-4 rounded bg-form border-border" />
                            </div>
                            <div className="flex-1 flex items-center">
                                <div className="w-6 h-6 bg-form rounded-md mr-2"></div>
                                <div className="flex items-center">
                                    <span className="font-medium text-sm">{collection.name}</span>
                                    {collection.verified && (
                                        <svg className="h-4 w-4 ml-1 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                                            <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="w-12 text-right text-sm font-medium">{collection.items}</div>
                            <div className="w-28 text-right text-sm font-medium">{collection.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};