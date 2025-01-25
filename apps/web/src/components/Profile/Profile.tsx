'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wallet, Award, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockUserProfile = {
    id: 1,
    username: "CryptoRunner",
    avatar_url: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
    wallet_address: "0x1234...5678",
    stats: {
        totalRuns: 156,
        bestMile: "5:20",
        competitionsWon: 12,
        totalEarnings: 25000
    }
};

const mockCards = [
    {
        id: 1,
        runner: "SpeedDemon",
        rarity: "Legendary",
        multiplier: 2.5,
        image_url: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
    },
    {
        id: 2,
        runner: "MarathonMaster",
        rarity: "Exotic",
        multiplier: 2.0,
        image_url: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
    }
];

const mockLineups = [
    {
        id: 1,
        name: "Squad 1",
        cards: 2,
        totalMultiplier: "5.5x",
        lastUsed: "2024-01-20",
        performance: "2nd Place"
    },
    {
        id: 2,
        name: "Squad 2",
        cards: 2,
        totalMultiplier: "6.2x",
        lastUsed: "2024-01-18",
        performance: "1st Place"
    }
];

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'Legendary': return 'text-yellow-400';
        case 'Exotic': return 'text-purple-400';
        case 'Rare': return 'text-blue-400';
        default: return 'text-gray-400';
    }
};
export const Profile = () => {
    const [activeTab, setActiveTab] = useState<'cards' | 'lineups'>('cards');

    return (
        <div className="ml-48 w-full py-12 px-4 h-full">
            {/* Profile Header */}
            <div className="bg-phyt_form rounded-xl p-8 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-6">
                        <Image
                            src={mockUserProfile.avatar_url}
                            alt={mockUserProfile.username}
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-phyt_blue"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-phyt_text mb-2">
                                {mockUserProfile.username}
                            </h1>
                            <div className="flex items-center gap-2 text-phyt_text_secondary">
                                <Wallet className="h-4 w-4" />
                                <span className="font-mono">{mockUserProfile.wallet_address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-phyt_text_secondary mb-1">Total Runs</p>
                            <p className="text-2xl text-phyt_blue font-mono">
                                {mockUserProfile.stats.totalRuns}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-phyt_text_secondary mb-1">Best Mile</p>
                            <p className="text-2xl text-phyt_blue font-mono">
                                {mockUserProfile.stats.bestMile}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-phyt_text_secondary mb-1">Competitions Won</p>
                            <p className="text-2xl text-phyt_blue font-mono">
                                {mockUserProfile.stats.competitionsWon}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-phyt_text_secondary mb-1">Total Earnings</p>
                            <p className="text-2xl text-phyt_blue font-mono">
                                {mockUserProfile.stats.totalEarnings} ETH
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collection Tabs */}
            <div className="flex gap-4 mb-8">
                <Button
                    onClick={() => setActiveTab('cards')}
                    className={`px-8 py-3 ${activeTab === 'cards'
                        ? 'bg-phyt_blue text-black'
                        : 'bg-phyt_form text-phyt_text'
                        }`}
                >
                    <Award className="mr-2 h-5 w-5" />
                    My Cards
                </Button>
                <Button
                    onClick={() => setActiveTab('lineups')}
                    className={`px-8 py-3 ${activeTab === 'lineups'
                        ? 'bg-phyt_blue text-black'
                        : 'bg-phyt_form text-phyt_text'
                        }`}
                >
                    <Trophy className="mr-2 h-5 w-5" />
                    My Lineups
                </Button>
            </div>

            {/* Cards View */}
            {activeTab === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockCards.map(card => (
                        <div key={card.id} className="bg-phyt_form rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-phyt_text mb-1">
                                        {card.runner}
                                    </h3>
                                    <p className={`text-sm font-medium ${getRarityColor(card.rarity)}`}>
                                        {card.rarity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-phyt_text_secondary text-sm">Multiplier</p>
                                    <p className="text-xl font-mono text-phyt_blue">
                                        {card.multiplier}x
                                    </p>
                                </div>
                            </div>
                            <Image
                                src={card.image_url}
                                alt={card.runner}
                                width={300}
                                height={400}
                                className="rounded-lg w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lineups View */}
            {activeTab === 'lineups' && (
                <div className="space-y-6">
                    {mockLineups.map(lineup => (
                        <div key={lineup.id} className="bg-phyt_form rounded-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-phyt_text mb-2">
                                        {lineup.name}
                                    </h3>
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-phyt_text_secondary text-sm">Cards</p>
                                            <p className="text-lg font-mono text-phyt_blue">
                                                {lineup.cards}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-phyt_text_secondary text-sm">Multiplier</p>
                                            <p className="text-lg font-mono text-phyt_blue">
                                                {lineup.totalMultiplier}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-phyt_text_secondary text-sm">Last Used</p>
                                        <div className="flex items-center gap-2 text-phyt_text">
                                            <Clock className="h-4 w-4" />
                                            <span>{lineup.lastUsed}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-phyt_text_secondary text-sm">Performance</p>
                                        <p className="text-lg font-medium text-phyt_blue">
                                            {lineup.performance}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
};