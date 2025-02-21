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
            <div className="flex h-16 items-center top-0 sticky z-50 w-full nav-glass backdrop-blur-sm">
                <div className="flex flex-1 items-center justify-between px-16">
                    <CommandSearch />

                    <div className="flex items-center gap-6">
                        {/* PHYT Points - Loading */}
                        <div className="flex items-center gap-2">
                            <Image
                                src={"https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFEiSLtcfUBum8Mgfo1FYyXsrLc3tahDp4Q2JS"}
                                alt="Phytness Points"
                                width={24}
                                height={38}
                            />
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </div>

                        {/* Wallet Balance - Loading */}
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-24 animate-pulse rounded bg-muted hidden sm:block" />
                        </div>

                        {/* User Profile - Loading */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                            <div className="h-4 w-20 animate-pulse rounded bg-muted hidden sm:block" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-16 items-center top-0 sticky z-50 w-100 nav-glass backdrop-blur-sm">
            <div className="flex flex-1 items-center justify-between px-16">
                <CommandSearch />

                <div className="flex items-center gap-2">
                    {/* PHYT Points */}
                    <div className="group rounded-xl flex items-center gap-4 px-4 py-2 transition-colors duration-200 hover:bg-black/10 hover:cursor-pointer">
                        <span className="text-md font-medium">
                            {user.phytness_points}
                        </span>
                        <Image
                            src={"https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFEiSLtcfUBum8Mgfo1FYyXsrLc3tahDp4Q2JS"}
                            alt="Phytness Points"
                            width={13}
                            height={12}
                        />
                    </div>

                    <div className="h-8 w-px bg-white/20 mx-2"></div>

                    {/* Wallet Balance */}
                    <div className="group rounded-xl flex items-center gap-4 px-4 py-2 transition-colors duration-200 hover:bg-black/10 hover:cursor-pointer">
                        <div className="hidden lg:block">
                            <p className="text-md font-medium">
                                {balance ? `${Number(formatEther(balance.value)).toFixed(4)} ETH` : '0.0000 ETH'}
                            </p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/20 mx-2"></div>

                    {/* User Profile */}
                    <div className="group rounded-xl flex items-center gap-4 p-4 py-2 transition-colors duration-200 hover:bg-black/10 hover:cursor-pointer">
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