// src/app/(root)/profile/layout.tsx
'use client';

import React from 'react';

import { Loader2 } from 'lucide-react';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useGetUser, useGetUserCards } from '@/hooks/use-users';

export default function ProfileLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const {
        data: user,
        isFetching: fetchingUser,
        status: userFetchStatus
    } = useGetUser();
    const { data: cards, isFetching: fetchingCards } = useGetUserCards();

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
        <div className="flex flex-col pl-14 min-h-screen bg-background">
            <div className="relative">
                <ProfileHeader user={user} cards={cards ?? []} />
            </div>
            <div className="flex flex-col">
                <ProfileTabs />
                <div className="px-6 py-4">{children}</div>
            </div>
        </div>
    );
}
