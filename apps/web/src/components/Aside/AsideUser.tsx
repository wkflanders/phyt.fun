"use client";

import React from "react";
import { useGetUser } from "@/hooks/use-get-user";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

const DEFAULT_AVATAR = "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut";

export const AsideUser = () => {
    const { user: privyUser, ready } = usePrivy();
    const { data: user, isLoading, isFetching, error } = useGetUser();

    // Component is mounted but Privy is not ready
    if (!ready) {
        return <div className="p-6">Initializing...</div>;
    }

    // No Privy user - should redirect to login
    if (!privyUser) {
        return <div className="p-6">Please log in</div>;
    }

    // Loading states
    if (isLoading || isFetching) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-4 rounded-xl">
                    <div className="animate-pulse rounded-full bg-gray-700 h-12 w-12" />
                    <div className="flex-1 space-y-2">
                        <div className="animate-pulse h-4 bg-gray-700 rounded w-3/4" />
                        <div className="animate-pulse h-3 bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        console.error('AsideUser - Error:', error);
        return (
            <div className="w-full">
                <div className="flex items-center gap-4 rounded-xl">
                    <Image
                        src={DEFAULT_AVATAR}
                        alt="Default avatar"
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-red"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-red text-sm">Error loading profile</p>
                    </div>
                </div>
            </div>
        );
    }

    // No user data
    if (!user) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-4 rounded-xl">
                    <Image
                        src={DEFAULT_AVATAR}
                        alt="Default avatar"
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-phyt_form_border"
                        unoptimized
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-phyt_text_secondary text-sm">Profile not found</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success state with user data
    return (
        <div className="w-full">
            <div className="flex items-center gap-4 rounded-xl">
                <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-phyt_form"
                    unoptimized
                />
                <div className="flex-1 min-w-0">
                    <p className="text-phyt_text font-medium text-lg truncate">
                        {user.username}
                    </p>
                    {user.wallet_address && (
                        <p className="text-phyt_text_secondary text-sm truncate font-mono">
                            {user.wallet_address.slice(0, 6)}...
                            {user.wallet_address.slice(-4)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};