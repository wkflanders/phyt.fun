import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { PackRarities } from '@phyt/types';

interface PackProps {
    onSelectPack: (packType: string, price: string) => void;
    isPending: boolean;
}

export const Pack: React.FC<PackProps> = ({ onSelectPack, isPending }) => {
    const [selectedPack, setSelectedPack] = useState<string | null>(null);

    return (
        <div className="w-full max-w-5xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 text-white">Choose Your Pack</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PackRarities.map((pack) => (
                    <div
                        key={pack.id}
                        className={`bg-gradient-to-br ${pack.bgGradient} backdrop-blur-sm rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 border-2 ${selectedPack === pack.id
                            ? 'border-primary scale-105'
                            : 'border-gray-800 hover:border-primary/50'
                            }`}
                        onClick={() => setSelectedPack(pack.id)}
                    >
                        <div className="relative w-48 h-48 mb-4">
                            <Image
                                src={pack.image}
                                alt={`${pack.name} Pack`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold text-white">{pack.name}</h3>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-5 w-5 text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-900 border border-gray-800 text-white max-w-xs">
                                        <p>{pack.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="text-lg font-medium text-white mb-4">{pack.price} ETH</div>

                        <Button
                            onClick={() => onSelectPack(pack.id, pack.price)}
                            disabled={isPending}
                            className="w-full h-12 bg-primary hover:bg-primary-shade text-black font-bold"
                        >
                            {isPending ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                                    Opening...
                                </>
                            ) : (
                                `Open Pack`
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};