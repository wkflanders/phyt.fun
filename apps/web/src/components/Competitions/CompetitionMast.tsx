'use client';

import React from 'react';
import Image from 'next/image';
import { useGetMajorCompetitions } from '@/hooks/use-get-competitions';
import { Loader2, Calendar, TrophyIcon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EthIcon, PhytIcon } from '@/lib/icons';

export const CompetitionMast = () => {
    const { data: majorCompetitions, isLoading, error } = useGetMajorCompetitions();
    const { toast } = useToast();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 w-full bg-black/50 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !majorCompetitions || majorCompetitions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 w-full bg-black/50 rounded-xl text-text-dim">
                <p>No major competitions available at the moment.</p>
            </div>
        );
    }

    // Get the first major competition to feature
    const featuredCompetition = majorCompetitions[0];

    // Format dates
    const startDate = new Date(featuredCompetition.start_time);
    const endDate = new Date(featuredCompetition.end_time);

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
    let statusText = "Active";
    let statusColor = "text-green-400";

    if (isUpcoming) {
        statusText = "Upcoming";
        statusColor = "text-text";
    } else if (isCompleted) {
        statusText = "Completed";
        statusColor = "text-text-dim";
    }

    // Generate competition image URL
    const imageUrl = `https://d5mhfgomyfg7p.cloudfront.net/competitions/${featuredCompetition.id}.png`;

    return (
        <div className="relative w-full h-96 overflow-hidden rounded-xl">
            <div className="absolute inset-0 z-0">
                <Image
                    src={imageUrl}
                    alt={featuredCompetition.event_name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <div className={`inline-flex items-center text-sm font-medium mb-2 ${statusColor}`}>
                    <span className="flex h-2 w-2 rounded-full mr-2 animate-pulse"
                        style={{ backgroundColor: '#FE205D' }} />
                    {statusText}
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">
                    {featuredCompetition.event_name}
                </h1>

                <div className="flex items-center mb-4 text-text-dim">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                        {formatDate(startDate)} - {formatDate(endDate)}
                    </span>
                </div>

                <div className="flex items-center mb-4 text-text-dim">
                    <TrophyIcon className="h-5 w-5 mr-2" />
                    <span className="mr-0.5">
                        {featuredCompetition.jackpot}
                    </span>
                    <EthIcon color={'text-text-dim'} />
                    <span className="ml-2 mr-0.5">
                        1,000
                    </span>
                    PHYT
                </div>

                {featuredCompetition.distance_m && (
                    <p className="text-text-dim mb-6">
                        Min. {featuredCompetition.distance_m} Miles
                    </p>
                )}

                <div className="flex flex-row gap-4">
                    <Button
                        className="px-6 py-6 bg-secondary rounded-xl text-text text-md hover:bg-secondary-shade"
                        onClick={() => {
                            toast({
                                title: "Competition Active",
                                description: "All runners are automatically participating in this competition!"
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
                                title: "Coming soon",
                                description: "Competition details will be available soon!"
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