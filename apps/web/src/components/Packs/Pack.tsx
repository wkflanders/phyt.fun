import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { PackTypes } from '@phyt/types';

interface PackProps {
    onSelectPack: (packType: string, price: string) => void;
    isPending: boolean;
}

export const Pack: React.FC<PackProps> = ({ onSelectPack, isPending }) => {
    return (
        <div className="w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PackTypes.map((pack) => (
                    <div
                        key={pack.id}
                        className={`
                      bg-gradient-to-br 
                      ${pack.bgGradient} 
                      backdrop-blur-sm 
                      rounded-xl 
                      p-6 
                      flex 
                      flex-col 
                      items-center 
                    `}>
                        <div className="relative w-96 h-96 mb-4">
                            <Image
                                src={pack.image}
                                alt={`${pack.name} Pack`}
                                fill
                                className="object-contain hover:scale-105 transition-all duration-300"
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl text-white">{pack.name}</h3>
                            <TooltipProvider>
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger>
                                        <HelpCircle className="h-5 w-5 text-primary" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-zinc-900 bg-opacity-70 backdrop-blur-xl text-text max-w-md">
                                        <p>{pack.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="text-lg text-text mb-4">{pack.price} ETH</div>

                        <Button
                            variant="outline"
                            onClick={() => onSelectPack(pack.id, pack.price)}
                            disabled={isPending}
                            className="px-12 py-6 bg-zinc-900 bg-opacity-20 backdrop-blur-xl border-white/10 hover:bg-white/10 rounded-xl"
                        >
                            {isPending ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-text animate-spin mr-2"></div>
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