// src/app/(root)/profile/page.tsx
'use client';

import React, { useState } from 'react';
import { ItemsToolbar } from '@/components/profile/ItemsToolbar';
import { ItemsGrid } from '@/components/profile/ItemsGrid';
import { SearchSidebar } from '@/components/profile/SearchSidebar';
import { useGetUserCards, useGetUser } from '@/hooks/use-users';
import { useToast } from '@/hooks/use-toast';
import { CardWithMetadata } from '@phyt/types';

export default function ProfilePage() {
    const { data: user } = useGetUser();
    const {
        data: cards,
        isFetching: fetchingCards,
        status: cardsFetchStatus
    } = useGetUserCards();
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredCards = React.useMemo(() => {
        if (!cards) return [];
        if (!searchTerm) return cards;
        return cards.filter(
            (card) =>
                card.metadata.runner_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                card.metadata.season
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                card.metadata.token_id
                    .toString()
                    .includes(searchTerm.toLowerCase())
        );
    }, [cards, searchTerm]);

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
            <SearchSidebar
                cards={cards || []}
                onSearchResultsChange={setSearchTerm}
            />
            <div className="flex-1">
                <ItemsToolbar
                    totalItems={filteredCards.length}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onLevelUp={handleLevelUp}
                    onBurn={handleBurn}
                />
                <ItemsGrid
                    fetchingCards={fetchingCards}
                    cardsFetchStatus={cardsFetchStatus}
                    items={filteredCards}
                    columns={3}
                    user={user}
                />
            </div>
        </div>
    );
}
