'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGetUserCards } from '@/hooks/use-users';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { CardWithMetadata, User } from '@phyt/types';
import { CardModal } from '@/components/CardModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InventoryProps {
    user: User;
    viewMode?: 'grid' | 'list';
}

export const Inventory: React.FC<InventoryProps> = ({
    user,
    viewMode = 'grid'
}) => {
    const { data: cards, isLoading, error } = useGetUserCards();
    const [selectedCard, setSelectedCard] = useState<CardWithMetadata | null>(null);

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center py-12 text-text">
                Failed to load cards
            </div>
        );
    }

    if (!cards || cards.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mb-4">
                    <Image
                        src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
                        alt="No cards"
                        width={120}
                        height={120}
                        className="mx-auto rounded-full"
                    />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No items to display</h3>
                <p className="text-text-dim mb-6">Get started by purchasing your first pack</p>
                <Button variant="default" className="bg-primary text-black hover:bg-primary/90">
                    Buy Packs
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className={cn(
                viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    : "divide-y divide-white/10"
            )}>
                {cards.map((card) => (
                    viewMode === 'grid' ? (
                        <div
                            key={card.id}
                            className="cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedCard(card)}
                        >
                            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                <Image
                                    src={card.metadata.image_url}
                                    alt={`Card ${card.id}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="mt-2">
                                <p className="text-text font-medium truncate">{`${card.metadata.runner_name}`}</p>
                                <div className="flex justify-between">
                                    <p className="text-text-dim text-sm">{card.metadata.rarity}</p>
                                    <p className="text-primary text-sm font-medium">
                                        {card.metadata.rarity === 'bronze' ? '0.005 ETH' :
                                            card.metadata.rarity === 'silver' ? '0.02 ETH' :
                                                card.metadata.rarity === 'gold' ? '0.05 ETH' : '0.01 ETH'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            key={card.id}
                            className="flex py-4 cursor-pointer hover:bg-card/30"
                            onClick={() => setSelectedCard(card)}
                        >
                            <div className="relative w-16 h-20 rounded-md overflow-hidden border border-white/10">
                                <Image
                                    src={card.metadata.image_url}
                                    alt={`Card ${card.id}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-text font-medium">{`Runner #${card.metadata.runner_name}`}</p>
                                <p className="text-text-dim text-sm">{card.metadata.rarity}</p>
                                <p className="text-text-dim text-sm">Token ID: {card.token_id}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <div className="flex items-center text-text-dim">
                                    <MoreHorizontal size={20} />
                                </div>
                                <div className="text-primary font-medium">
                                    {card.metadata.rarity === 'bronze' ? '0.005 ETH' :
                                        card.metadata.rarity === 'silver' ? '0.02 ETH' :
                                            card.metadata.rarity === 'gold' ? '0.05 ETH' : '0.01 ETH'}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Card Modal */}
            {selectedCard && (
                <CardModal
                    user={user}
                    card={selectedCard}
                    isOpen={!!selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </>
    );
};

export default Inventory;