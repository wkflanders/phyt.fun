import React from 'react';
import { ArrowDown, Grid, List, Columns, Menu, Flame, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CardWithMetadata } from '@phyt/types';

interface ItemsToolbarProps {
    totalItems: number;
    viewMode: string;
    onViewModeChange: (mode: string) => void;
    onLevelUp?: (card: CardWithMetadata) => void;
    onBurn?: (card: CardWithMetadata) => void;
}

export const ItemsToolbar: React.FC<ItemsToolbarProps> = ({
    totalItems,
    viewMode,
    onViewModeChange,
    onLevelUp,
    onBurn
}) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <div className="flex gap-2 ml-2">
                    <Button
                        variant="outline"
                        className="justify-start gap-2 text-text hover:text-text hover:bg-black/20"
                        onClick={() => onLevelUp?.(null as any)}
                    >
                        <ArrowUpCircle className="h-4 w-4" />
                        Level Up
                    </Button>
                    <Button
                        variant="outline"
                        className="justify-start gap-2 text-red-400 hover:text-red-400 hover:bg-red-400/10"
                        onClick={() => onBurn?.(null as any)}
                    >
                        <Flame className="h-4 w-4" />
                        Burn
                    </Button>
                </div>
            </div>

            <div className="flex items-center">
                <Button
                    variant="outline"
                    className="justify-start gap-2 text-text hover:text-text hover:bg-black/20 mr-2"
                >
                    Recently received
                    <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="justify-start gap-2 text-text hover:text-text hover:bg-black/20 mr-2"
                >
                    Season
                    <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="justify-start gap-2 text-text hover:text-text hover:bg-black/20 mr-2"
                >
                    Status
                    <ArrowDown className="h-4 w-4" />
                </Button>

                <div className="flex border border-border rounded-lg overflow-hidden">
                    <Button
                        variant="outline"
                        className={cn(
                            "p-2 rounded-none",
                            viewMode === 'grid' ? "bg-secondary/30" : "bg-form"
                        )}
                        onClick={() => onViewModeChange('grid')}
                    >
                        <Grid className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className={cn(
                            "p-2 rounded-none",
                            viewMode === 'large-grid' ? "bg-secondary/30" : "bg-form"
                        )}
                        onClick={() => onViewModeChange('large-grid')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        className={cn(
                            "p-2 rounded-none",
                            viewMode === 'list' ? "bg-secondary/30" : "bg-form"
                        )}
                        onClick={() => onViewModeChange('list')}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className={cn(
                            "p-2 rounded-none",
                            viewMode === 'columns' ? "bg-secondary/30" : "bg-form"
                        )}
                        onClick={() => onViewModeChange('columns')}
                    >
                        <Columns className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};