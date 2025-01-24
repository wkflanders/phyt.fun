"use client";

import React from 'react';
import { AsideItem } from './AsideItem';
import { AsideUser } from './AsideUser';
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
    return (
        <div className="flex flex-col gap-20 bg-black items-center h-full w-80 pt-12 pr-2">
            <div className="">
                <Link href="/">
                    <Image src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v" alt="PHYT" width={250} height={250} />
                </Link>
            </div>
            <ul className="flex flex-col gap-10 pr-16">
                <AsideItem
                    title='Home'
                    icon="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFjCYt24i2WN9i60TEnCxu4AG71LvblfVDYBOj"
                    alt="Home"
                    href="/"
                />
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
            </ul>
            <div className="">
                <Link href="/profile">
                    <AsideUser />
                </Link>
            </div>
        </div>
    );
};
