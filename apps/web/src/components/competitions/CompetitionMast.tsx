'use client';

import { Button } from '@/components/ui/button';
import { useGetMajorCompetitions } from '@/hooks/use-competitions';
import { useToast } from '@/hooks/use-toast';
import { EthIcon, PhytIcon } from '@/lib/icons';

import Image from 'next/image';
import React from 'react';

import { Loader2, Calendar, TrophyIcon, Layers } from 'lucide-react';

export const CompetitionMast = () => {
    const {
        data: majorCompetitions,
        isLoading,
        error
    } = useGetMajorCompetitions();
    const { toast } = useToast();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-64 bg-zinc-900 shadow-lg rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !majorCompetitions || majorCompetitions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64 bg-zinc-900 shadow-lg rounded-xl text-text-dim">
                <p>No major competitions available at the moment.</p>
            </div>
        );
    }

    // Get the first major competition to feature
    const featuredCompetition = majorCompetitions[0];

    // Format dates
    const startDate = new Date(featuredCompetition.startTime);
    const endDate = new Date(featuredCompetition.endTime);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Calculate if competition is active, upcoming, or completed
    const now = new Date();
    const isActive = now >= startDate && now <= endDate;
    const isUpcoming = now < startDate;
    const isCompleted = now > endDate;

    // Get status text and color
    let statusText = 'Active';
    let statusColor = 'text-green-400';

    if (isUpcoming) {
        statusText = 'Upcoming';
        statusColor = 'text-text';
    } else if (isCompleted) {
        statusText = 'Completed';
        statusColor = 'text-text-dim';
    }

    // Generate competition image URL
    const imageUrl = `https://d5mhfgomyfg7p.cloudfront.net/competitions/${String(featuredCompetition.id)}.png`;

    return (
        <div className="relative w-full overflow-hidden h-96 shadow-lg rounded-xl">
            <div className="absolute inset-0 z-0">
                <Image
                    src={imageUrl}
                    alt={featuredCompetition.eventName}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <div
                    className={`inline-flex items-center text-sm font-medium mb-2 ${statusColor}`}
                >
                    <span
                        className="flex w-2 h-2 mr-2 rounded-full animate-pulse"
                        style={{ backgroundColor: '#FE205D' }}
                    />
                    {statusText}
                </div>

                <h1 className="mb-2 text-4xl font-bold text-white">
                    {featuredCompetition.eventName}
                </h1>

                <div className="flex items-center mb-4 text-text-dim">
                    <Calendar className="w-6 h-6 mr-2" />
                    <span>
                        {formatDate(startDate)} - {formatDate(endDate)}
                    </span>
                </div>

                <div className="flex items-center mb-4 text-text-dim">
                    <TrophyIcon className="w-6 h-6 mr-2" />
                    <EthIcon color={'text-text-dim'} />
                    <span className="mr-2">{featuredCompetition.jackpot}</span>
                    <PhytIcon color={`text-text-dim`} />
                    <span className="ml-0.5">1,000</span>
                </div>

                {featuredCompetition.distance && (
                    <p className="mb-6 text-text-dim">
                        {featuredCompetition.distance} Miles
                    </p>
                )}

                <div className="flex flex-row gap-4">
                    <Button
                        className="px-6 py-6 bg-secondary rounded-xl text-text text-md hover:bg-secondary-shade"
                        onClick={() => {
                            toast({
                                title: 'Competition Active',
                                description:
                                    'All runners are automatically participating in this competition!'
                            });
                        }}
                    >
                        <Layers className="w-4 h-4 mr-2" />
                        Build Your Deck
                    </Button>

                    <Button
                        variant="outline"
                        className="px-4 py-6 border-white/10 hover:bg-white/10 rounded-xl"
                        onClick={() => {
                            toast({
                                title: 'Coming soon',
                                description:
                                    'Competition details will be available soon!'
                            });
                        }}
                    >
                        Leaderboard
                    </Button>
                </div>
            </div>
        </div>
    );
};
