import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface ItemCardProps {
    id: string;
    name: string;
    collection: string;
    image: string;
    price: string;
    views: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    id,
    name,
    collection,
    image,
    price,
    views
}) => {
    return (
        <Card className="overflow-hidden border-border hover:border-text-dim transition-all bg-card">
            <div className="relative">
                <div className="w-full h-48">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute top-2 right-2 flex items-center bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <svg className="h-3 w-3 mr-1 text-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" />
                        <path d="M12 5C7.58172 5 4 8.58172 4 12C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 12C20 8.58172 16.4183 5 12 5Z" />
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" />
                    </svg>
                    <span className="text-xs text-text-dim">{views}</span>
                </div>
            </div>
            <CardContent className="p-3">
                <div className="text-sm text-text-dim">{collection}</div>
                <div className="font-medium mt-1 text-text">{name}</div>
                <div className="flex justify-between mt-2">
                    <div className="text-xs text-text-dim">Listed</div>
                    <div className="text-sm font-medium text-text">{price}</div>
                </div>
            </CardContent>
        </Card>
    );
};