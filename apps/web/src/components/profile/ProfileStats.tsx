import { CardWithMetadata } from '@phyt/types';
import React from 'react';

interface ProfileStatsProps {
    cards: CardWithMetadata[];
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ cards }) => {
    // Calculate total value (placeholder for now)
    const totalValue = '0 ETH';
    const usdValue = '$0.00';

    // Calculate NFT and token percentages
    const totalCards = cards.length;
    const nftPercentage =
        totalCards > 0 ? Math.round((totalCards / totalCards) * 100) : 0;
    const tokenPercentage = 100 - nftPercentage;

    return (
        <div className="flex space-x-4 mb-1">
            <div className="text-right">
                <div className="text-sm text-text-dim">NET WORTH</div>
                <div className="text-xl font-bold text-text">{totalValue}</div>
            </div>
            <div className="text-right">
                <div className="text-sm text-text-dim">USD VALUE</div>
                <div className="text-xl font-bold text-text">{usdValue}</div>
            </div>
            <div className="text-right">
                <div className="text-sm text-text-dim">NFTS</div>
                <div className="text-xl font-bold text-text">
                    {nftPercentage}%
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm text-text-dim">TOKENS</div>
                <div className="text-xl font-bold text-text">
                    {tokenPercentage}%
                </div>
            </div>
        </div>
    );
};
