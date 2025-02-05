import React from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { X, Star, Eye, TwitterIcon } from 'lucide-react';
import { User, CardWithMetadata } from '@phyt/types';
import Image from 'next/image';

interface CardModalProps {
    user: User,
    isOpen: boolean;
    onClose: () => void;
    card: CardWithMetadata;
}

export const CardModal = ({ isOpen, onClose, card }: CardModalProps) => {
    if (!card) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col md:flex-row gap-8 p-4 bg-black min-h-[600px]">
                {/* Left Column - Image */}
                <div className="flex-1">
                    <Image
                        src={card.metadata.image_url}
                        alt={`Card ${card.metadata.token_id}`}
                        width={400}
                        height={600}
                        className="w-full rounded-lg"
                    />
                </div>

                {/* Right Column - Details */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Tournament Rank Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Tournament Rank</h3>
                            <span className="text-lg text-phyt_blue">83</span>
                        </div>
                        {/* Graph placeholder - you'd want to replace this with your actual graph component */}
                        <div className="h-48 bg-black border border-gray-800 rounded-lg"></div>
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-phyt_text_dark w-2 h-2 rounded-full" />
                                    <span className="text-sm text-phyt_text_secondary">368</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-phyt_text_secondary" />
                                    <span className="text-sm text-phyt_text_secondary">657K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black p-4 rounded-lg border border-gray-800">
                            <p className="text-sm text-phyt_text_secondary mb-1">Price</p>
                            <p className="text-lg font-bold text-white">0.007</p>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800">
                            <p className="text-sm text-phyt_text_secondary mb-1">Highest bid</p>
                            <p className="text-lg font-bold text-white">0.005</p>
                        </div>
                        <div className="bg-black p-4 rounded-lg border border-gray-800">
                            <p className="text-sm text-phyt_text_secondary mb-1">Last sale</p>
                            <p className="text-lg font-bold text-white">0.006</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-4">
                        <Button className="w-full bg-phyt_blue hover:bg-phyt_blue/80">Buy</Button>
                        <Button className="w-full bg-phyt_blue hover:bg-phyt_blue/80">Sell</Button>
                        <Button variant="outline" className="w-full border-gray-800 text-white hover:bg-gray-800">
                            Bid
                        </Button>
                    </div>

                    {/* Social Stats */}
                    <div className="mt-auto">
                        <div className="flex items-center gap-4 text-phyt_text_secondary">
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">121.5k</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span className="text-sm">1.7k</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TwitterIcon className="w-4 h-4" />
                                <span className="text-sm">65</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </Modal>
    );
};