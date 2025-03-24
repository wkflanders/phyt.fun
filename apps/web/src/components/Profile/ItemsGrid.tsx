import React from 'react';
import { ItemCard } from './ItemCard';
import { CardWithMetadata, User } from '@phyt/types';
import { Loader2 } from 'lucide-react';
import { formatSeasonName } from '@/lib/utils';
interface ItemsGridProps {
    items: CardWithMetadata[];
    columns?: number;
    fetchingCards: boolean;
    cardsFetchStatus: string;
    user: User;
}

export const ItemsGrid: React.FC<ItemsGridProps> = ({
    items,
    columns = 3,
    fetchingCards,
    cardsFetchStatus,
    user
}) => {
    if (items.length === 0) {
        if (!fetchingCards && cardsFetchStatus !== 'pending') {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-text">No cards</p>
                </div>
            );
        } else {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-text" />
                </div>
            );
        }
    }

    return (
        <div className={`mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10`}>
            {items.map((item) => (
                <ItemCard
                    key={item.id}
                    id={item.id.toString()}
                    name={`${item.metadata.runner_name}`}
                    season={formatSeasonName(item.metadata.season)}
                    image={item.metadata.image_url}
                    price="0 ETH" // TODO: Get actual price from market data
                    card={item}
                    user={user}
                />
            ))}
        </div>
    );
};
