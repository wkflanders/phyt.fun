import React from 'react';

export const ProfileStats: React.FC = () => {
    const stats = [
        { label: 'NET WORTH', value: '4.90 ETH' },
        { label: 'USD VALUE', value: '$9,702.63' },
        { label: 'NFTS', value: '30%' },
        { label: 'TOKENS', value: '70%' }
    ];

    return (
        <div className="flex space-x-4 mb-1">
            {stats.map((stat, index) => (
                <div key={index} className="text-right">
                    <div className="text-sm text-text-dim">{stat.label}</div>
                    <div className="text-xl font-bold text-text">{stat.value}</div>
                </div>
            ))}
        </div>
    );
};