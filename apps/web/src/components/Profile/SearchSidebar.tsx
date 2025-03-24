import React, { useState } from 'react';
import { CardWithMetadata } from '@phyt/types';
import { Search } from 'lucide-react';

interface SearchSidebarProps {
    cards: CardWithMetadata[];
    onSearchResultsChange?: (searchQuery: string) => void;
}

const formatSeasonName = (seasonId: string): string => {
    return seasonId
        .replace('season_', 'Season ')
        .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
};

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
    cards,
    onSearchResultsChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Group cards by season
    const seasons = cards.reduce((acc, card) => {
        const season = card.metadata.season;
        if (!acc[season]) {
            acc[season] = {
                name: season,
                items: 0,
                value: '0 ETH' // TODO: Calculate actual value
            };
        }
        acc[season].items++;
        return acc;
    }, {} as Record<string, { name: string; items: number; value: string; }>);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setIsSearching(query.length > 0);

        if (query.length === 0) {
            onSearchResultsChange?.(query);
            return;
        }

        const searchResults = cards.filter(card => {
            const searchLower = query.toLowerCase();
            return (
                card.metadata.runner_name.toLowerCase().includes(searchLower) ||
                card.metadata.season.toLowerCase().includes(searchLower) ||
                card.metadata.token_id.toString().includes(searchLower)
            );
        });

        onSearchResultsChange?.(query);
    };

    return (
        <div className="w-72 mr-6">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-dim" />
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-border rounded-lg text-text placeholder:text-text-dim focus:outline-none"
                />
            </div>

            <div className="space-y-1">
                {isSearching ? (
                    <div className="text-sm text-text-dim">
                        {cards.filter(card =>
                            card.metadata.runner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            card.metadata.season.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            card.metadata.token_id.toString().includes(searchQuery.toLowerCase())
                        ).length} results found
                    </div>
                ) : (
                    Object.values(seasons).map((season, index) => (
                        <div key={index} className="flex items-center py-3 border-b border-border/50">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-text">
                                    {formatSeasonName(season.name)}
                                </div>
                                <div className="text-xs text-text-dim">{season.items} ITEMS</div>
                            </div>
                            <div className="w-28 text-right text-sm font-medium">{season.value}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}; 