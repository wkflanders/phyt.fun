import React from 'react';
import Image from 'next/image';
import { useAccount, useBalance } from 'wagmi';
import { CommandSearch } from '@/components/CommandSearch';
import { useGetUser } from '@/hooks/use-get-user';
import { Trophy } from 'lucide-react';
import { WalletPopover } from '@/components/WalletPopover';
import { formatEther } from 'viem';

export const Navbar = () => {
    const { data: user, isLoading: userLoading } = useGetUser();
    const { address } = useAccount();
    const { data: balance } = useBalance({
        address: address as `0x${string}`,
    });

    if (userLoading || !user) {
        return (
            <div className="sticky top-0 z-50 w-full nav-glass backdrop-blur-sm">
                <div className="flex h-14 items-center">
                    <div className="flex flex-1 items-center justify-between">
                        <CommandSearch />
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-14 items-center top-0 sticky z-50 w-100 nav-glass backdrop-blur-sm">
            <div className="flex flex-1 items-center justify-between px-16">
                <CommandSearch />

                <div className="flex items-center gap-6">
                    {/* PHYT Points */}
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-phyt_blue" />
                        <span className="text-sm font-medium">
                            1,234 PHYT
                        </span>
                    </div>

                    {/* Wallet Balance */}
                    <div className="flex items-center gap-2">
                        <WalletPopover />
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium">
                                {balance ? `${Number(formatEther(balance.value)).toFixed(4)} ETH` : '0.0000 ETH'}
                            </p>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-2">
                        <Image
                            src={user.avatar_url}
                            alt={user.username}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="hidden text-sm font-medium sm:block">
                            {user.username}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;