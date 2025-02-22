"use client";

import React from "react";
import Image from "next/image";
import { useAccount, useBalance } from "wagmi";
import { CommandSearch } from "@/components/CommandSearch";
import { useGetUser } from "@/hooks/use-get-user";
import { WalletPopover } from "@/components/WalletPopover";
import { formatEther } from "viem";

type NavbarProps = {
    scrolled: boolean;
};

export const Navbar = ({ scrolled }: NavbarProps) => {
    const { data: user, isLoading: userLoading } = useGetUser();
    const { address } = useAccount();
    const { data: balance, isLoading: balanceLoading } = useBalance({
        address: address as `0x${string}`,
    });
    const [isWalletOpen, setIsWalletOpen] = React.useState(false);

    const toggleWallet = () => {
        setIsWalletOpen(!isWalletOpen);
    };

    const PointsSkeleton = () => (
        <div className="group rounded-xl flex items-center gap-4 px-4 py-2">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-700/50" />
            <div className="h-4 w-4 animate-pulse rounded bg-gray-700/50" />
        </div>
    );

    const WalletSkeleton = () => (
        <div className="group rounded-xl flex items-center gap-4 px-4 py-2">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-700/50" />
        </div>
    );

    const ProfileSkeleton = () => (
        <div className="group rounded-xl flex items-center gap-4 p-4 py-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700/50" />
            <div className="hidden h-4 w-20 animate-pulse rounded bg-gray-700/50 sm:block" />
        </div>
    );

    return (
        <div
            className={`
    fixed top-0 z-40 flex h-16 w-full items-center nav-glass pl-56 border-b
    ${scrolled ? "border-white/10 bg-black bg-opacity-10" : "border-transparent bg-transparent"} 
  `}
        >
            <div className="flex flex-1 items-center justify-between px-16">
                <CommandSearch />

                <div className="flex items-center gap-2">
                    {userLoading ? (
                        <PointsSkeleton />
                    ) : (
                        <div className="group rounded-xl flex items-center gap-4 px-4 py-2 transition-colors duration-200 hover:bg-black/20 hover:cursor-pointer">
                            <span className="text-md font-medium">
                                {user?.phytness_points ?? 0}
                            </span>
                            <Image
                                src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFEiSLtcfUBum8Mgfo1FYyXsrLc3tahDp4Q2JS"
                                alt="Phytness Points"
                                width={13}
                                height={12}
                            />
                        </div>
                    )}

                    <div className="h-8 w-px bg-white/20 mx-2"></div>

                    {!address || balanceLoading ? (
                        <WalletSkeleton />
                    ) : (
                        <div
                            className="group rounded-xl flex items-center gap-4 px-4 py-2 transition-colors duration-200 hover:bg-black/20 cursor-pointer"
                            onClick={toggleWallet}
                        >
                            <div className="hidden lg:block">
                                <p className="text-md font-medium">
                                    {balance
                                        ? `${Number(formatEther(balance.value)).toFixed(4)} ETH`
                                        : "0.0000 ETH"}
                                </p>
                            </div>
                            {isWalletOpen && (
                                <WalletPopover onClose={() => setIsWalletOpen(false)} />
                            )}
                        </div>
                    )}

                    <div className="h-8 w-px bg-white/20 mx-2"></div>

                    {userLoading ? (
                        <ProfileSkeleton />
                    ) : (
                        <div className="group rounded-xl flex items-center gap-4 p-4 py-2 transition-colors duration-200 hover:bg-black/20 hover:cursor-pointer">
                            {user?.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt="avatar"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-700/50 animate-pulse" />
                            )}
                            {user?.username ? (
                                <span className="hidden text-sm font-medium sm:block">
                                    {user.username}
                                </span>
                            ) : (
                                <div className="hidden sm:block h-4 w-20 animate-pulse rounded bg-gray-700/50" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};