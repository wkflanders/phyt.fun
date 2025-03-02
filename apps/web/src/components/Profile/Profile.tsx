'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Inventory } from './Inventory';
import { Loader2 } from 'lucide-react';
import { useGetUser } from '@/hooks/use-users';
import { Wallet, Award, Trophy, Clock } from 'lucide-react';

export const Profile = () => {
    const { data: user, isLoading: userLoading, error: userError } = useGetUser();
    const [activeTab, setActiveTab] = useState<'cards' | 'lineups'>('cards');

    if (userLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
            </div>
        );
    }

    if (!user || userError) {
        return (
            <div className="flex-1 flex items-center justify-center text-phyt_text">
                Failed to load profile
            </div>
        );
    }

    const walletAddress = user.wallet_address ? `${user.wallet_address.substring(0, 4)}...${user.wallet_address.substring(user.wallet_address.length - 4)}` : 'Failed to load';

    if (true) {
        return (
            <div className="w-full py-12 px-4 h-full">
                {/* Profile Header */}
                <div className="bg-phyt_form rounded-xl p-8 mb-12 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-center gap-6">
                            <Image
                                src={user.avatar_url}
                                alt={user.username}
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-phyt_blue"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-phyt_text mb-2">
                                    {user.username}
                                </h1>
                                <div className="flex items-center gap-2 text-phyt_text_secondary">
                                    <Wallet className="h-4 w-4" />
                                    {walletAddress}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-phyt_text_secondary mb-1">Total Runs</p>
                                <p className="text-2xl text-phyt_blue font-mono">
                                    {/* {mockUserProfile.stats.totalRuns} */}1
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-phyt_text_secondary mb-1">Best Mile</p>
                                <p className="text-2xl text-phyt_blue font-mono">
                                    {/* {mockUserProfile.stats.bestMile} */}1
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-phyt_text_secondary mb-1">Competitions Won</p>
                                <p className="text-2xl text-phyt_blue font-mono">
                                    {/* {mockUserProfile.stats.competitionsWon} */}1
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-phyt_text_secondary mb-1">Total Earnings</p>
                                <p className="text-2xl text-phyt_blue font-mono">
                                    {/* {mockUserProfile.stats.totalEarnings} ETH */}1
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards View */}
                {activeTab === 'cards' && (
                    <div className="px-4">
                        <div>
                            <h3 className="text-2xl font-bold text-phyt_text mb-2">Inventory</h3>
                        </div>
                        <Inventory
                            user={user}
                        />
                    </div>
                )}
            </div>

        );
    };
};
