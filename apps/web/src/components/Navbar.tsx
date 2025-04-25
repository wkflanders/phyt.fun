'use client';
import Image from 'next/image';
import React from 'react';
import { useAccount, useBalance } from 'wagmi';

import { CommandSearch } from '@/components/CommandSearch';
import { WalletPopover } from '@/components/WalletPopover';
import { useGetUser } from '@/hooks/use-users';

import { NotificationsPopover } from './NotificationsPopover';
import { ProfilePopover } from './profile/ProfilePopover';

interface NavbarProps {
    scrolled: boolean;
}

export const Navbar = ({ scrolled }: NavbarProps) => {
    const { data: user, isLoading: userLoading } = useGetUser();
    const { address } = useAccount();
    const { data: balance, isLoading: balanceLoading } = useBalance(
        address ? { address } : { address: undefined }
    );

    const PointsSkeleton = () => (
        <div className="flex items-center gap-4 px-4 py-2 group rounded-xl">
            <div className="w-16 h-5 rounded animate-pulse bg-gray-700/50" />
            <div className="w-4 h-4 rounded animate-pulse bg-gray-700/50" />
        </div>
    );

    const WalletSkeleton = () => (
        <div className="flex items-center gap-4 px-4 py-2 group rounded-xl">
            <div className="w-24 h-5 rounded animate-pulse bg-gray-700/50" />
        </div>
    );

    return (
        <div
            className={`fixed top-0 z-40 flex h-16 w-full items-center border-b ${
                scrolled
                    ? 'border-white/10 bg-zinc-900/20 backdrop-blur-lg'
                    : 'border-transparent bg-transparent'
            }`}
        >
            <div className="flex items-center justify-between flex-1 pl-24 pr-12">
                <CommandSearch />
                <div className="flex items-center gap-1">
                    {userLoading ? (
                        <PointsSkeleton />
                    ) : (
                        <div className="flex items-center gap-4 px-4 py-2 transition-colors duration-200 group rounded-xl hover:bg-black/20 hover:cursor-pointer">
                            <span className="font-medium text-md">
                                {user?.phytnessPoints ?? 0}
                            </span>
                            <Image
                                src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFEiSLtcfUBum8Mgfo1FYyXsrLc3tahDp4Q2JS"
                                alt="Phytness Points"
                                width={13}
                                height={12}
                            />
                        </div>
                    )}
                    <div className="w-px h-8 mx-2 bg-white/20"></div>
                    {!address || balanceLoading ? (
                        <WalletSkeleton />
                    ) : (
                        <WalletPopover />
                    )}
                    <div className="w-px h-8 mx-2 bg-white/20"></div>
                    <NotificationsPopover />
                    <div className="w-px h-8 mx-2 bg-white/20"></div>
                    <ProfilePopover
                        avatarUrl={user?.avatarUrl}
                        username={user?.username}
                    />
                </div>
            </div>
        </div>
    );
};
