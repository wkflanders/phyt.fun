"use client";

import React from "react";
import { useGetUser } from "@/hooks/use-get-user";
import Image from "next/image";

export const AsideUser = () => {
    const { data: user, isLoading, error } = useGetUser();

    // 1) If user is not in the cache (or is being fetched),
    // isLoading might be true. Provide a loading fallback.
    if (isLoading) {
        return <div className="p-6">Loading user...</div>;
    }

    // 2) If there's an error, show fallback
    if (error) {
        return <div className="p-6 text-red-500">Error loading user</div>;
    }

    // 3) If there's no user, you can show a "Not logged in" message
    if (!user) {
        return <div className="p-6">No user found</div>;
    }

    // 4) Otherwise, user data is available!
    return (
        <div className="mt-auto p-6 w-full">
            <div className="flex items-center gap-4 rounded-xl p-4">
                <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-phyt_blue"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-phyt_text font-medium text-lg truncate">
                        {user.username}
                    </p>
                    <p className="text-phyt_text_secondary text-sm truncate font-mono">
                        {user.wallet_address?.slice(0, 6)}...
                        {user.wallet_address?.slice(-4)}
                    </p>
                </div>
            </div>
        </div>
    );
};
