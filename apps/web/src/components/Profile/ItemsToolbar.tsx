import React from 'react';
import { Search, ArrowDown, Settings, Grid, List, Columns, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemsToolbarProps {
    totalItems: number;
    viewMode: string;
    onViewModeChange: (mode: string) => void;
}

export const ItemsToolbar: React.FC<ItemsToolbarProps> = ({
    totalItems,
    viewMode,
    onViewModeChange
}) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
                <button className="p-2 text-text-dim hover:text-text">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" />
                    </svg>
                </button>
                <div className="relative ml-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dim h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search for items"
                        className="bg-form border border-border rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="ml-2 text-sm text-text-dim">{totalItems} ITEMS</div>
            </div>

            <div className="flex items-center">
                <FilterButton label="Recently received" />
                <FilterButton label="Chain" />
                <FilterButton label="Status" />

                <button className="p-2 bg-form border border-border rounded-lg text-text mr-2">
                    <Settings className="h-5 w-5" />
                </button>

                <div className="flex border border-border rounded-lg overflow-hidden">
                    <ViewModeButton
                        active={viewMode === 'grid'}
                        onClick={() => onViewModeChange('grid')}
                        icon={<Grid className="h-5 w-5" />}
                    />
                    <ViewModeButton
                        active={viewMode === 'large-grid'}
                        onClick={() => onViewModeChange('large-grid')}
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                            </svg>
                        }
                    />
                    <ViewModeButton
                        active={viewMode === 'list'}
                        onClick={() => onViewModeChange('list')}
                        icon={<Menu className="h-5 w-5" />}
                    />
                    <ViewModeButton
                        active={viewMode === 'columns'}
                        onClick={() => onViewModeChange('columns')}
                        icon={<Columns className="h-5 w-5" />}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper components for ItemsToolbar
const FilterButton = ({ label }: { label: string; }) => (
    <div className="relative mr-2">
        <button className="flex items-center gap-2 bg-form border border-border rounded-lg px-3 py-2 text-sm">
            <span>{label}</span>
            <ArrowDown className="h-4 w-4" />
        </button>
    </div>
);

const ViewModeButton = ({
    active,
    onClick,
    icon
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}) => (
    <button
        className={cn(
            "p-2",
            active ? "bg-secondary/30" : "bg-form"
        )}
        onClick={onClick}
    >
        {icon}
    </button>
);