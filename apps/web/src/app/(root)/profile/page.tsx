'use client';

import { CardWithMetadata } from '@phyt/types';

import { ItemsGrid } from '@/components/profile/ItemsGrid';
import { ItemsToolbar } from '@/components/profile/ItemsToolbar';
import { SearchSidebar } from '@/components/profile/SearchSidebar';
import { useToast } from '@/hooks/use-toast';
import { useGetUser } from '@/hooks/use-users';

import React, { useState } from 'react';

export default function ProfilePage() {
    const { data: user } = useGetUser();
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredCards = React.useMemo(() => {
        if (!searchTerm) return [];
        return [];
    }, [searchTerm]);

    const handleLevelUp = (card: CardWithMetadata) => {
        toast({
            title: 'Level Up',
            description: 'Level up functionality coming soon!'
        });
    };

    const handleBurn = (card: CardWithMetadata) => {
        toast({
            title: 'Burn Card',
            description: 'Burn functionality coming soon!'
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="flex">
            <SearchSidebar cards={[]} onSearchResultsChange={setSearchTerm} />
            <div className="flex-1">
                <ItemsToolbar
                    totalItems={filteredCards.length}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onLevelUp={handleLevelUp}
                    onBurn={handleBurn}
                />
                <ItemsGrid
                    fetchingCards={false}
                    cardsFetchStatus="success"
                    items={filteredCards}
                    columns={3}
                    user={user}
                />
            </div>
        </div>
    );
}
