'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Zap, Users, Heart, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetRunnerActivities } from '@/hooks/use-runners';
import { RunnerActivity } from '@phyt/types';

type TabType = 'all' | 'pooled';

export const ActivityBox: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const { data: activities, isLoading, isError } = useGetRunnerActivities(activeTab !== 'all' ? activeTab : undefined);

    return (
        <Card className="w-1/5 bg-transparent rounded-none border-0 border-l border-white/10">
            <CardHeader className="pb-4 pt-0">
                <CardTitle className="text-text text-2xl flex font-normal items-center justify-center gap-2">
                    <Zap className="text-text" size={20} />
                    Recent Activity
                </CardTitle>
            </CardHeader>

            <div className="flex">
                <TabButton
                    isActive={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                    icon={<ArrowDown size={16} />}
                >
                    All Runners
                </TabButton>
                <TabButton
                    isActive={activeTab === 'pooled'}
                    onClick={() => setActiveTab('pooled')}
                    icon={<Users size={16} />}
                >
                    Pooled
                </TabButton>
            </div>

            <CardContent className="p-3">
                <div className="space-y-4 mt-2">
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
                        </div>
                    ) : isError ? (
                        <div className="text-center text-phyt_text_secondary py-4">
                            Error loading activities
                        </div>
                    ) : activities && activities.length > 0 ? (
                        activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))
                    ) : (
                        <div className="text-center text-phyt_text_secondary py-4">
                            No activity found
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={cn(
            'flex items-center gap-1 px-4 py-2 text-md transition-colors flex-1 justify-center',
            isActive
                ? 'text-text'
                : 'text-text-dim hover:text-text'
        )}
    >
        {icon}
        {children}
    </button>
);

interface ActivityItemProps {
    activity: RunnerActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    const distanceKm = (activity.distance_m / 1000).toFixed(1);

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image
                    src={activity.avatar_url}
                    alt={activity.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                />
                <div>
                    <p className="text-phyt_text font-medium">
                        {activity.username} <span className="text-phyt_text_third ml-1">| RUNNER</span>
                    </p>
                    <p className="text-phyt_text_secondary text-xs">
                        Ran {distanceKm} km • {activity.time_ago}
                    </p>
                </div>
            </div>
            {activity.is_pooled && (
                <span className="bg-phyt_form px-2 py-1 rounded-md text-xs text-phyt_blue">
                    Pooled
                </span>
            )}
        </div>
    );
};