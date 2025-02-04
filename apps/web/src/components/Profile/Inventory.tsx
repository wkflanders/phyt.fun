'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGetUserCards } from '@/hooks/use-get-user-cards';
import { Loader2 } from 'lucide-react';
import { CardRarity, User } from '@phyt/types';
import { OrderBookModal } from './OrderBook';

export interface CardResponse {
    id: number;
    tokenId: number;
    ownerId: number;
    imageUrl: string;
    rarity: CardRarity;
    multiplier: number;
}

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
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-6">
                <div className="grid grid-cols-3">
                    {cards?.map((card: CardResponse) => (
                        <div
                            key={card.id}
                            onClick={() => {
                                setSelectedCard(card);
                            }}
                            className="cursor-pointer transition-transform hover:scale-105"
                        >
                            <Image
                                src={card.imageUrl}
                                alt={`Card ${card.tokenId}`}
                                width={400}
                                height={600}
                                className="rounded-lg w-1/2 object-cover cursor-pointer transition-transform hover:scale-105"
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
            <OrderBookModal
                user={user}
                card={selectedCard}
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
            />
        </div>
    );
};