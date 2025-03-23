import React from 'react';
import { Card } from '@/components/ui/card';
import { useGetUserCards } from '@/hooks/use-users';

export const ProfileStats: React.FC = () => {
    const { data: cards } = useGetUserCards();

    const stats = [
        { label: 'Total Items', value: cards?.length || '0' },
        { label: 'Collections', value: '3' },
        { label: 'ETH Volume', value: '0.45 ETH' },
        { label: 'Best Offer', value: '0.10 ETH' }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-card rounded-xl p-4 border border-white/10">
                    <p className="text-text-dim mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-text">{stat.value}</p>
                </Card>
            ))}
        </div>
    );
};