'use client';

import React, { useState, useMemo } from 'react';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileTabs } from '@/components/Profile/ProfileTabs';
import { ItemsToolbar } from '@/components/Profile/ItemsToolbar';
import { ItemsGrid } from '@/components/Profile/ItemsGrid';
import { useGetUser, useGetUserCards } from '@/hooks/use-users';
import { Loader2 } from 'lucide-react';
import { CardWithMetadata } from '@phyt/types';
import { useToast } from '@/hooks/use-toast';
import { SearchSidebar } from '@/components/Profile/SearchSidebar';

export const Profile = () => {
    const { data: user, isFetching: fetchingUser, status: userFetchStatus } = useGetUser();
    const { data: cards, isFetching: fetchingCards, status: cardsFetchStatus } = useGetUserCards();
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredCards = useMemo(() => {
        if (!cards) return [];
        if (!searchTerm) return cards;
        return cards.filter(card => card.metadata.runner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.metadata.season.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.metadata.token_id.toString().includes(searchTerm.toLowerCase())
        );
    }, [cards, searchTerm]);

    const handleLevelUp = (card: CardWithMetadata) => {
        // TODO: Implement level up logic
        toast({
            title: "Level Up",
            description: "Level up functionality coming soon!",
        });
    };

    const handleBurn = (card: CardWithMetadata) => {
        // TODO: Implement burn logic
        toast({
            title: "Burn Card",
            description: "Burn functionality coming soon!",
        });
    };

    if (!user) {
        if (userFetchStatus !== 'pending' && !fetchingUser) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-text">User not found</p>
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-text" />
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col pl-4 min-h-screen bg-background">
            <div className="relative">
                <ProfileHeader
                    user={user}
                    cards={cards || []}
                />
            </div>
            <div className="flex flex-col">
                <ProfileTabs />
                <div className="flex px-6 py-4">
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};