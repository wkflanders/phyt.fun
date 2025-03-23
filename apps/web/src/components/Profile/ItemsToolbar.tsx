import React from 'react';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemsToolbarProps {
    totalItems: number;
    viewMode: string;
    onViewModeChange: (mode: 'grid' | 'list') => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

export const ItemsToolbar: React.FC<ItemsToolbarProps> = ({
    totalItems,
    sortBy,
    onSortChange
}) => {
    return (
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-dim h-4 w-4" />
                <input
                    type="text"
                    placeholder="Search items"
                    className="bg-form border border-border rounded-lg py-2 pl-10 pr-4 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="flex items-center gap-2">
                <div className="text-sm text-text-dim">{totalItems} ITEMS</div>

                <div>
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="h-9 bg-form border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recently_received">Recently received</SelectItem>
                            <SelectItem value="recently_created">Recently created</SelectItem>
                            <SelectItem value="price_high_to_low">Price: High to Low</SelectItem>
                            <SelectItem value="price_low_to_high">Price: Low to High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};