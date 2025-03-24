import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface ItemCardProps {
    id: string;
    name: string;
    collection: string;
    image: string;
    price: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    id,
    name,
    collection,
    image,
    price,
}) => {
    return (
        <div className="flex flex-col cursor-pointer group">
            <div className="relative w-full mb-2 p-2 -m-2">
                <div className="relative transition-transform duration-300 group-hover:scale-[1.05]">
                    <Image
                        src={image}
                        alt={name}
                        width={500}
                        height={500}
                        className="w-full h-auto"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                </div>
            </div>
            <Card className="w-full p-0">
                <CardContent className="px-3 py-3">
                    <div className="text-sm text-text-dim truncate">{collection}</div>
                    <div className="font-medium mt-1 text-base text-text truncate">{name}</div>
                    <div className="flex justify-between mt-2">
                        <div className="text-sm text-text-dim">Listed</div>
                        <div className="text-sm font-medium text-text">{price}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};