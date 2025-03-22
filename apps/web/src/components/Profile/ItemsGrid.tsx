import React from 'react';
import { ItemCard } from './ItemCard';

interface Item {
    id: string;
    name: string;
    collection: string;
    image: string;
    price: string;
    views: string;
}

interface ItemsGridProps {
    items: Item[];
    columns?: number;
}

export const ItemsGrid: React.FC<ItemsGridProps> = ({
    items,
    columns = 3
}) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
            {items.map((item) => (
                <ItemCard key={item.id} {...item} />
            ))}
        </div>
    );
};
