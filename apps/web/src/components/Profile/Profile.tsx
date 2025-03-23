'use client';

import React, { useState } from 'react';
import { useGetUser, useGetUserCards } from '@/hooks/use-users';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileTabs } from '@/components/Profile/ProfileTabs';
import { ProfileStats } from '@/components/Profile/ProfileStats';
import { Inventory } from '@/components/Profile/Inventory';
import { ItemsToolbar } from '@/components/Profile/ItemsToolbar';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/Profile/EmptyState';
import { ActivityTable } from '@/components/Profile/ActivityTable';
import { OffersTable } from '@/components/Profile/OffersTable';
import { FiltersPanel } from '@/components/Profile/FiltersPanel';

export const Profile = () => {
    const { data: user, isLoading: userLoading } = useGetUser();
    const { data: cards, isLoading: cardsLoading } = useGetUserCards();
    const [activeTab, setActiveTab] = useState('collected');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('recently_received');

    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen text-text">
                Failed to load profile
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-background">
            {/* Banner */}
            <div className="relative w-full h-60 bg-gradient-to-r from-primary/30 to-secondary/30">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent"></div>
            </div>

            <div className="container px-4 relative z-10">
                <ProfileHeader user={user} userCards={cards} />

                <ProfileStats />

                <ProfileTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    filterOpen={filterOpen}
                    onFilterToggle={() => setFilterOpen(!filterOpen)}
                />

                <div className="mt-6">
                    {activeTab === 'collected' && (
                        <>
                            {filterOpen && <FiltersPanel />}
                            <ItemsToolbar
                                totalItems={cards.length || 0}
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                            <Inventory
                                user={user}
                                viewMode={viewMode}
                            />
                        </>
                    )}

                    {activeTab === 'created' && (
                        <EmptyState
                            title="No created items yet"
                            description="Get started by creating your own NFTs"
                        />
                    )}

                    {activeTab === 'activity' && (
                        <ActivityTable user={user} />
                    )}

                    {activeTab === 'offers' && (
                        <OffersTable user={user} />
                    )}

                    {activeTab === 'favorites' && (
                        <EmptyState
                            title="No favorite items yet"
                            description="Items you heart will appear here"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;