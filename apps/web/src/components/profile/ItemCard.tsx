import { CardWithMetadata, User } from '@phyt/types';
import Image from 'next/image';
import React from 'react';

import { ListingModal } from '@/components/marketplace/ListingModal';
import { Card, CardContent } from '@/components/ui/card';



interface ItemCardProps {
    id: string;
    name: string;
    season: string;
    image: string;
    price: string;
    card: CardWithMetadata;
    user: User;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    id,
    name,
    season,
    image,
    price,
    card,
    user
}) => {
    const [showListingModal, setShowListingModal] = React.useState(false);

    return (
        <>
            <div
                className="flex flex-col cursor-pointer group"
                onClick={() => { setShowListingModal(true); }}
            >
                <div className="relative w-full border-white/10 border-b-0 border rounded-t-2xl">
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
                <Card className="w-full p-0 rounded-none bg-neutral-700/20 backdrop-blur-lg border-white/10 border-t-0">
                    <CardContent className="px-4 py-4">
                        <div className="font-medium text-base text-text truncate">
                            {name}
                        </div>
                        <div className="text-sm mt-2 text-text-dim truncate">
                            {season}
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="text-sm text-text-dim">Listed</div>
                            <div className="text-sm font-medium text-text">
                                {price}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ListingModal
                user={user}
                isOpen={showListingModal}
                onClose={() => { setShowListingModal(false); }}
                card={card}
            />
        </>
    );
};
