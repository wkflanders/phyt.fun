// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
// import { useGetUser } from '@/hooks/use-users';
// import { Inventory } from '@/components/Profile/Inventory';
// import { Loader2, Settings, Share2, Filter, Grid, List, MoreHorizontal } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';

// export const Profile = () => {
//     const { data: user, isLoading: userLoading } = useGetUser();
//     const [activeTab, setActiveTab] = useState('collected');
//     const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//     const [filterOpen, setFilterOpen] = useState(false);

//     const walletAddress = user?.wallet_address
//         ? `${user.wallet_address.substring(0, 6)}...${user.wallet_address.substring(user.wallet_address.length - 4)}`
//         : 'Connect Wallet';

//     const statCards = [
//         { label: 'Total Runs', value: '27' },
//         { label: 'Best Mile', value: '5:24' },
//         { label: 'Competitions', value: '3' },
//         { label: 'Earnings', value: '0.45 ETH' }
//     ];

//     if (userLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         );
//     }

//     if (!user) {
//         return (
//             <div className="flex items-center justify-center min-h-screen text-text">
//                 Failed to load profile
//             </div>
//         );
//     }

//     return (
//         <div className="w-full min-h-screen bg-background">
//             {/* Banner */}
//             <div className="relative w-full h-60 bg-gradient-to-r from-primary/30 to-secondary/30">
//                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent"></div>
//             </div>

//             {/* Profile Header */}
//             <div className="container px-4 relative z-10">
//                 <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
//                     {/* Avatar */}
//                     <div className="relative">
//                         <div className="w-36 h-36 rounded-full border-4 border-background overflow-hidden bg-card">
//                             <Image
//                                 src={user.avatar_url}
//                                 alt={user.username}
//                                 width={144}
//                                 height={144}
//                                 className="object-cover"
//                             />
//                         </div>
//                     </div>

//                     {/* Profile Info */}
//                     <div className="flex-1">
//                         <h1 className="text-3xl font-bold text-text mb-1">{user.username}</h1>
//                         <div className="flex items-center gap-2 text-text-dim mb-4">
//                             <span>{walletAddress}</span>
//                             <span className="text-text-dim">•</span>
//                             <span>Runner</span>
//                         </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2 self-end mb-4">
//                         <Button variant="outline" size="sm" className="gap-2">
//                             <Share2 size={16} />
//                             <span className="hidden sm:inline">Share</span>
//                         </Button>
//                         <Button variant="outline" size="sm" className="gap-2">
//                             <Settings size={16} />
//                             <span className="hidden sm:inline">Edit Profile</span>
//                         </Button>
//                         <Button variant="outline" size="sm" className="p-2">
//                             <MoreHorizontal size={16} />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
//                     {statCards.map((stat, index) => (
//                         <div key={index} className="bg-card rounded-xl p-4 border border-white/10">
//                             <p className="text-text-dim mb-1">{stat.label}</p>
//                             <p className="text-2xl font-bold text-text">{stat.value}</p>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Tabs */}
//                 <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
//                     <div className="flex justify-between items-center border-b border-white/10">
//                         <TabsList className="bg-transparent h-auto p-0">
//                             <TabsTrigger
//                                 value="collected"
//                                 className={cn(
//                                     "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
//                                     activeTab === 'collected' ? 'text-text' : 'text-text-dim'
//                                 )}
//                             >
//                                 Collected
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="created"
//                                 className={cn(
//                                     "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
//                                     activeTab === 'created' ? 'text-text' : 'text-text-dim'
//                                 )}
//                             >
//                                 Created
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="activity"
//                                 className={cn(
//                                     "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
//                                     activeTab === 'activity' ? 'text-text' : 'text-text-dim'
//                                 )}
//                             >
//                                 Activity
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="runs"
//                                 className={cn(
//                                     "px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
//                                     activeTab === 'runs' ? 'text-text' : 'text-text-dim'
//                                 )}
//                             >
//                                 Runs
//                             </TabsTrigger>
//                         </TabsList>

//                         {/* View Controls */}
//                         <div className="flex gap-2">
//                             <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => setFilterOpen(!filterOpen)}
//                                 className={cn("text-text-dim hover:text-text", filterOpen && "text-primary")}
//                             >
//                                 <Filter size={18} />
//                             </Button>
//                             <div className="flex rounded-md overflow-hidden border border-white/10">
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => setViewMode('grid')}
//                                     className={cn(
//                                         "rounded-none border-r border-white/10",
//                                         viewMode === 'grid' ? "bg-card text-primary" : "text-text-dim"
//                                     )}
//                                 >
//                                     <Grid size={18} />
//                                 </Button>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => setViewMode('list')}
//                                     className={cn(
//                                         "rounded-none",
//                                         viewMode === 'list' ? "bg-card text-primary" : "text-text-dim"
//                                     )}
//                                 >
//                                     <List size={18} />
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Tab Contents */}
//                     <TabsContent value="collected" className="mt-6">
//                         {user && (
//                             <Inventory
//                                 user={user}
//                             />
//                         )}
//                     </TabsContent>

//                     <TabsContent value="created" className="mt-6">
//                         <div className="text-center py-12">
//                             <div className="mb-4">
//                                 <Image
//                                     src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
//                                     alt="No items created"
//                                     width={120}
//                                     height={120}
//                                     className="mx-auto rounded-full"
//                                 />
//                             </div>
//                             <h3 className="text-xl font-semibold text-text mb-2">No created items yet</h3>
//                             <p className="text-text-dim mb-6">Get started by creating your first NFT as a runner</p>
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="activity" className="mt-6">
//                         <div className="border border-white/10 rounded-lg overflow-hidden">
//                             <div className="p-4 border-b border-white/10 bg-card">
//                                 <h3 className="text-text font-medium">Recent Activity</h3>
//                             </div>
//                             <div className="divide-y divide-white/10">
//                                 {[1, 2, 3].map((i) => (
//                                     <div key={i} className="p-4 flex items-center hover:bg-card/30">
//                                         <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
//                                             {i === 1 ? <Settings size={18} /> : i === 2 ? <Share2 size={18} /> : <Grid size={18} />}
//                                         </div>
//                                         <div>
//                                             <p className="text-text">
//                                                 {i === 1 ? 'Purchased a pack' : i === 2 ? 'Completed a run' : 'Joined competition'}
//                                             </p>
//                                             <p className="text-text-dim text-sm">{i} day{i !== 1 ? 's' : ''} ago</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="runs" className="mt-6">
//                         <div className="border border-white/10 rounded-lg overflow-hidden">
//                             <div className="p-4 border-b border-white/10 bg-card">
//                                 <h3 className="text-text font-medium">Recent Runs</h3>
//                             </div>
//                             <div className="divide-y divide-white/10">
//                                 {[...Array(3)].map((_, i) => (
//                                     <div key={i} className="p-4 hover:bg-card/30">
//                                         <div className="flex justify-between mb-2">
//                                             <p className="text-text font-medium">Morning Run {i + 1}</p>
//                                             <p className="text-text-dim">{i + 1} day{i !== 0 ? 's' : ''} ago</p>
//                                         </div>
//                                         <div className="grid grid-cols-3 gap-4">
//                                             <div>
//                                                 <p className="text-text-dim text-sm">Distance</p>
//                                                 <p className="text-text">{(Math.random() * 5 + 2).toFixed(2)} mi</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-text-dim text-sm">Duration</p>
//                                                 <p className="text-text">{Math.floor(Math.random() * 30 + 20)}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-text-dim text-sm">Pace</p>
//                                                 <p className="text-text">{Math.floor(Math.random() * 3 + 7)}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')} /mi</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </TabsContent>
//                 </Tabs>
//             </div>
//         </div>
//     );
// };

'use client';

import React, { useState } from 'react';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileTabs } from '@/components/Profile/ProfileTabs';
import { CollectionsSidebar } from '@/components/Profile/CollectionsSidebar';
import { ItemsToolbar } from '@/components/Profile/ItemsToolbar';
import { ItemsGrid } from '@/components/Profile/ItemsGrid';

const collections = [
    { name: 'The Mountains', verified: true, items: 4, value: '0.50 WETH' },
    { name: 'RG Bytes', verified: true, items: 1, value: '0.48 WETH' },
    { name: 'bitbeast', verified: true, items: 6, value: '0.07 WETH' },
    { name: 'The Saudis', verified: true, items: 3, value: '0.06 WETH' }
];

const items = [
    {
        id: '1210',
        name: 'APOSTLE #1210',
        collection: 'Apostles: Genesis',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.02 ETH',
        views: '5,379'
    },
    {
        id: 'byte',
        name: 'RG Byte',
        collection: 'RG Bytes',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.57 ETH',
        views: '1,276'
    },
    {
        id: '5446',
        name: 'bitbeast #5446',
        collection: 'bitbeast',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.019 ETH',
        views: '3,887'
    },
    {
        id: '2045',
        name: 'bitbeast #2045',
        collection: 'bitbeast',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.019 ETH',
        views: '3,094'
    },
    {
        id: '5359',
        name: 'bitbeast #5359',
        collection: 'bitbeast',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.019 ETH',
        views: '3,021'
    },
    {
        id: '2929',
        name: 'bitbeast #2929',
        collection: 'bitbeast',
        image: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5',
        price: '0.0189 ETH',
        views: '3,424'
    }
];

export const Profile = () => {
    const [viewMode, setViewMode] = useState('grid');
    const user = {
        address: "0x5ed0...3c92",
        joinDate: "DEC 2024",
        addressShort: "5ED052",
        xp: "41 XP",
        loyalty: "LOYALTY 67.6%",
        avatarUrl: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
    };

    return (
        <div className="flex flex-col min-h-screen">
            <ProfileHeader {...user} />
            <ProfileTabs />

            <div className="flex flex-1 px-6 py-4">
                <CollectionsSidebar collections={collections} />

                <div className="flex-1">
                    <ItemsToolbar
                        totalItems={77}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />
                    <ItemsGrid items={items} columns={3} />
                </div>
            </div>
        </div>
    );
};