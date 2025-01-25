'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Helper function to format dates
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

// Mock competition data
const mockCompetition = {
    id: '1',
    title: 'Mile Run',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prizePool: 1000,
    entryFee: 10,
    maxParticipants: 100,
    currentParticipants: 47,
    status: 'active'
};

// Mock leaderboard data
const mockLeaderboard = [
    {
        id: '1',
        userId: '1',
        username: 'FitnessPro',
        avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        score: 2500
    },
    {
        id: '2',
        userId: '2',
        username: 'HealthWarrior',
        avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        score: 2350
    },
    {
        id: '3',
        userId: '3',
        username: 'GymMaster',
        avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        score: 2200
    },
    {
        id: '4',
        userId: '4',
        username: 'StrengthSeeker',
        avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        score: 2100
    },
    {
        id: '5',
        userId: '5',
        username: 'ActiveAthlete',
        avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        score: 1950
    }
];

// Mock current user
const mockCurrentUser = {
    id: '6',
    username: 'GymMaster',
    avatar_url: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'
};

export default function WeeklyCompetitionPage() {
    const { toast } = useToast();

    const handleJoinCompetition = async () => {
        toast({
            title: "Success",
            description: "Successfully joined this week's competition!"
        });
    };

    return (
        <div className="root-container">
            <div className="max-w-6xl mx-auto py-12">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-phyt_text mb-4">
                        Mile Run
                    </h1>
                    <p className="text-xl text-phyt_text_secondary mb-8">
                        Week of {formatDate(mockCompetition.startDate)}
                    </p>
                    <div className="flex justify-center gap-4">
                    </div>
                </div>

                {/* Timer */}
                <div className="bg-phyt_form rounded-lg p-6 mb-12 text-center">
                    <h3 className="text-2xl font-bold text-phyt_text mb-2">Time Remaining</h3>
                    <p className="text-3xl font-mono text-phyt_blue">6 Days 14 Hours 32 Minutes</p>
                </div>

                {/* Leaderboard */}
                <div className="bg-phyt_form rounded-lg p-8">
                    <h2 className="text-3xl font-bold text-phyt_text mb-6">Current Rankings</h2>
                    <div className="space-y-4">
                        {mockLeaderboard.map((entry, index) => (
                            <div
                                key={entry.id}
                                className={`flex items-center justify-between p-6 rounded-lg ${entry.userId === mockCurrentUser.id
                                    ? 'bg-phyt_code_box_bg border border-phyt_code_box_highlight'
                                    : 'bg-black/20'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <span className="text-3xl font-bold text-phyt_text">
                                        #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={entry.avatar_url}
                                            alt={entry.username}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                        <span className="text-xl text-phyt_text">
                                            {entry.username}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <span className="text-2xl font-mono text-phyt_blue">
                                        {entry.score} pts
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}