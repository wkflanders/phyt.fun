'use client';

import React from 'react';
import { useGetUser } from '@/hooks/use-get-user';
import Image from 'next/image';

export const AsideUser = () => {
    const { data: user, isLoading, error } = useGetUser();

    if (isLoading || !user) {
        return (
            <div className="mt-auto p-6 w-full">
                <div className="flex items-center gap-4 bg-phyt_form rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-24" />
                        <div className="h-3 bg-gray-700 rounded animate-pulse w-32" />
                    </div>
                </div>
            </div>
        );
    }
    if (error) return <div>Error loading user...</div>;

    return (
        <div className="mt-auto p-6 w-full">
            <div className="flex items-center gap-4 rounded-xl p-4">
                <div className="relative">
                    <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-phyt_blue"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-phyt_text font-medium text-lg truncate">
                        {user.username}
                    </p>
                    <p className="text-phyt_text_secondary text-sm truncate font-mono">
                        {user.wallet_address?.slice(0, 6)}...{user.wallet_address?.slice(-4)}
                    </p>
                </div>
            </div>
        </div>
    );
};
