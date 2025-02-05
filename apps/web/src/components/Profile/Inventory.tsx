'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGetUserCards } from '@/hooks/use-get-user-cards';
import { Loader2 } from 'lucide-react';
import { CardWithMetadata, User } from '@phyt/types';
import { CardModal } from '../CardModal';

interface InventoryProps {
    user: User;
}

export const Inventory = ({
    user
}: InventoryProps) => {
    const { data: cards, isLoading, error } = useGetUserCards();
    const [selectedCard, setSelectedCard] = useState<any>(null);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center text-phyt_text">
                Failed to load cards
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
                    {cards?.map((card: CardWithMetadata) => (
                        <div
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className="w-60 h-96 relative cursor-pointer"
                        >
                            <Image
                                src={card.metadata.image_url}
                                alt={`Card ${card.metadata.token_id}`}
                                fill
                                className="rounded-lg object-contain p-1 hover:scale-105 transition-transform duration-200"
                            />
                        </div>
                    ))}
                </div>

                {cards?.length === 0 && (
                    <div className="text-center text-phyt_text_secondary mt-8">
                        You don't have any cards yet
                    </div>
                )}
            </div>
            <CardModal
                user={user}
                card={selectedCard}
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
            />
        </div>
    );
};