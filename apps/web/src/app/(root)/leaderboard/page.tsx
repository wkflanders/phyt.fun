import React from 'react';

import DualLeaderboard from '@/components/leaderboard/DualLeaderboard';

export default function LeaderboardPage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-phyt_text mb-4">
                        Leaderboards
                    </h1>
                    <p className="text-phyt_text_secondary max-w-2xl mx-auto">
                        Track top performers across both running competitions
                        and gambling predictions. See who leads in earnings,
                        victories, and performance metrics.
                    </p>
                </div>

                <DualLeaderboard />
            </div>
        </div>
    );
}
