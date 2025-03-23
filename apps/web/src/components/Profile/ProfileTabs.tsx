import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, List, Filter, Star, Activity, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    filterOpen: boolean;
    onFilterToggle: () => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onTabChange,
    viewMode,
    onViewModeChange,
    filterOpen,
    onFilterToggle
}) => {
    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-8">
            <div className="flex justify-between items-center border-b border-white/10">
                <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger
                        value="collected"
                        className={cn(
                            "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            activeTab === 'collected' ? 'text-text' : 'text-text-dim'
                        )}
                    >
                        <span className="flex items-center">
                            <Grid size={18} className="mr-2" />
                            Collected
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="created"
                        className={cn(
                            "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            activeTab === 'created' ? 'text-text' : 'text-text-dim'
                        )}
                    >
                        <span className="flex items-center">
                            <Star size={18} className="mr-2" />
                            Created
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="activity"
                        className={cn(
                            "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            activeTab === 'activity' ? 'text-text' : 'text-text-dim'
                        )}
                    >
                        <span className="flex items-center">
                            <Activity size={18} className="mr-2" />
                            Activity
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="offers"
                        className={cn(
                            "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            activeTab === 'offers' ? 'text-text' : 'text-text-dim'
                        )}
                    >
                        <span className="flex items-center">
                            <Heart size={18} className="mr-2" />
                            Offers
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="favorites"
                        className={cn(
                            "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            activeTab === 'favorites' ? 'text-text' : 'text-text-dim'
                        )}
                    >
                        <span className="flex items-center">
                            <Clock size={18} className="mr-2" />
                            Favorites
                        </span>
                    </TabsTrigger>
                </TabsList>

                {/* View Controls - Only show for collected and created tabs */}
                {(activeTab === 'collected' || activeTab === 'created') && (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onFilterToggle}
                            className={cn("text-text-dim hover:text-text", filterOpen && "text-primary")}
                        >
                            <Filter size={18} />
                        </Button>
                        <div className="flex rounded-md overflow-hidden border border-white/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewModeChange('grid')}
                                className={cn(
                                    "rounded-none border-r border-white/10",
                                    viewMode === 'grid' ? "bg-card text-primary" : "text-text-dim"
                                )}
                            >
                                <Grid size={18} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewModeChange('list')}
                                className={cn(
                                    "rounded-none",
                                    viewMode === 'list' ? "bg-card text-primary" : "text-text-dim"
                                )}
                            >
                                <List size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Tabs>
    );
};