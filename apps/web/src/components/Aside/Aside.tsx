"use client";

import React from 'react';
import { AsideItem } from './AsideItem';
import { AsideUser } from './AsideUser';
import { useGetUser } from '@/hooks/use-get-user';
import Image from 'next/image';
import Link from 'next/link';

/*
    Search
    
    Home
    Marketplace
    Packs

    Competitions
    Leaderboard
*/

export const Aside = () => {
    const { data: user, isLoading, isFetching, error } = useGetUser();
    return (
        <div className="flex flex-col gap-20 bg-transparent items-start h-full w-20 sm:w-80 overflow-y-hidden">
            <div className="">
                <Link href="/">
                    <Image src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v" alt="PHYT" width={250} height={250} />
                </Link>
            </div>
            <ul className="flex flex-col gap-5 ">
                <AsideItem
                    title='Home'
                    icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFjCYt24i2WN9i60TEnCxu4AG71LvblfVDYBOj"
                    alt="Home"
                    href="/"
                />
                <div className="flex flex-col gap-5 mt-8">
                    <AsideItem
                        title='Marketplace'
                        icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFcKqWHlAO3u4aLCj7PXSYQFNrnfTkKEGxheAW"
                        alt="Home"
                        href="/marketplace"
                    />
                    <AsideItem
                        title='Packs'
                        icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF3oRI4gvDkJmxutZaE5dj0qbGXU9Kl6ASci7P"
                        alt="Home"
                        href="/pack"
                    />
                </div>
                <div className="flex flex-col gap-5 mt-8">
                    <AsideItem
                        title='Competitions'
                        icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFL2IvVWhjKv5P0VOJfl7QwA3BIXScraqCdeWM"
                        alt="Home"
                        href="/competition"
                    />
                    <AsideItem
                        title='Leaderboard'
                        icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFxyQ0CdZz3I5p1a46fCZAOEuKYTwvngb8WLiV"
                        alt="Home"
                        href="/leaderboard"
                    />
                </div>
                {user?.role === 'admin' && (
                    <div className="flex flex-col gap-5 mt-8">
                        <AsideItem
                            title='Admin'
                            icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFYwsAHsPCduK0erjAyG7QSRxcnhM5Iv3YskTm"
                            alt="Admin"
                            href="/admin"
                        />
                    </div>
                )}
            </ul>
            <div className="mt-auto mb-6">
                <Link href="/profile">
                    <AsideUser
                        user={user}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        error={error}
                    />
                </Link>
            </div>
        </div>
    );
};
