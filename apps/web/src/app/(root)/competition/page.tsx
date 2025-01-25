import React from 'react';
import CompetitionsList from '@/components/Competitions/CompetitionsList';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Timer } from 'lucide-react';

export default function CompetitionsPage() {
    const stats = [
        {
            label: 'Total Participants',
            value: '1,248',
            icon: Users,
            color: 'text-phyt_blue'
        },
        {
            label: 'Total Prize Pool',
            value: '25.5 ETH',
            icon: Timer,
            color: 'text-phyt_blue'
        }
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-phyt_text mb-4">Competitions</h1>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="bg-phyt_form border-phyt_form_border">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <p className="text-phyt_text_secondary">{stat.label}</p>
                                    <p className="text-2xl font-bold text-phyt_text">{stat.value}</p>
                                </div>
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <CompetitionsList />
            </div>
        </div>
    );
}