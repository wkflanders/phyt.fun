'use client';

import { useLogout } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfilePopoverProps {
    avatarUrl?: string;
    username?: string;
}

export const ProfilePopover = ({
    avatarUrl,
    username
}: ProfilePopoverProps) => {
    const router = useRouter();
    const { logout } = useLogout({
        onSuccess: () => {
            router.push('/login');
        }
    });

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-4 px-4 py-2 transition-colors duration-200 group rounded-xl data-[state=open]:bg-black/20 hover:bg-black/20 hover:cursor-pointer"
                >
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={`${username ?? 'Profile'} avatar`}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <Skeleton className="w-8 h-8 rounded-full" />
                    )}
                    {username ? (
                        <span className="text-sm font-medium">{username}</span>
                    ) : (
                        <Skeleton className="h-5 w-24" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="center"
                className="w-[12vw] bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-lg"
            >
                <div className="flex flex-col gap-2">
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        View Profile
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Activity
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Offers
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Listings
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Competitions
                    </Link>
                    <hr className="my-1" />
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Runs
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Progress
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Performance
                    </Link>
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Integrations
                    </Link>
                    <hr className="my-1" />
                    <Link
                        href="/profile"
                        className="p-3 hover:bg-black/20 rounded"
                    >
                        Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                        onClick={handleLogout}
                        className="p-3 text-red-500 flex items-center gap-2 hover:bg-black/20 rounded"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
