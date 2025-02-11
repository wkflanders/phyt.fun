'use client';

import React, { FC, useState } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Timer,
    Navigation,
    Ruler,
    type LucideProps
} from 'lucide-react';
import { cn } from '@/lib/utils';

/** -----------------------------
 *    1) Define your data types
 * -----------------------------
 */
interface User {
    name: string;
    avatar: string;
}

interface RunData {
    coordinates: Array<[number, number]>;
    distance: string;
    pace: string;
    time: string;
}

interface Post {
    id: number;
    user: User;
    content: string;
    runData: RunData;
    likes: number;
    comments: number;
    shares: number;
    time: string;
}

/** ----------------------------------
 *   2) Create a typed mock data array
 * ----------------------------------
 */
const mockPosts: Post[] = [
    {
        id: 1,
        user: {
            name: 'boatsandlogs',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFzH1tTYSPrsGziypw0WOcRQSY1DebF2V6ATHX',
        },
        content: 'lightwork',
        runData: {
            coordinates: [
                [0, 0],
                [20, 15],
                [40, 25],
                [60, 40],
                [80, 30],
                [100, 45],
            ],
            distance: '5.2',
            pace: '8:30',
            time: '44:12',
        },
        likes: 124,
        comments: 18,
        shares: 5,
        time: '2h ago',
    },
    {
        id: 2,
        user: {
            name: 'jc9923',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
        },
        content: 'Quick morning jog',
        runData: {
            coordinates: [
                [10, 10],
                [30, 40],
                [50, 30],
                [70, 50],
                [90, 35],
            ],
            distance: '3.1',
            pace: '7:45',
            time: '24:05',
        },
        likes: 89,
        comments: 12,
        shares: 3,
        time: '4h ago',
    },
    {
        id: 3,
        user: {
            name: 'rob11121',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFvL3WgyBlUwOnrYHhoyXe7VEfG4udaTSLBDkK',
        },
        content: '',
        runData: {
            coordinates: [
                [5, 5],
                [25, 35],
                [45, 25],
                [65, 45],
                [85, 30],
            ],
            distance: '6.8',
            pace: '9:15',
            time: '1:02:54',
        },
        likes: 56,
        comments: 8,
        shares: 2,
        time: '6h ago',
    },
];

/** -------------------------------
 *   3) Type your sub-components
 * -------------------------------
 */

// Props for the RunMap component
interface RunMapProps {
    coordinates: Array<[number, number]>;
    distance: string;
}

const RunMap: FC<RunMapProps> = ({ coordinates, distance }) => {
    const padding = 20;
    const scaleBarHeight = 30;
    const width = 400;
    const height = 200 - scaleBarHeight;

    const xValues = coordinates.map(([x]) => x);
    const yValues = coordinates.map(([, y]) => y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const xScale = (width - padding * 2) / (maxX - minX);
    const yScale = (height - padding * 2) / (maxY - minY);
    const scale = Math.min(xScale, yScale);

    const transformedPath = coordinates.map(([x, y]) => [
        padding + (x - minX) * scale,
        padding + (y - minY) * scale,
    ]);

    const gridSize = 20;

    const pathLengthInMiles = parseFloat(distance);
    const pixelsPerMile =
        Math.sqrt(
            Math.pow(transformedPath[transformedPath.length - 1][0] - transformedPath[0][0], 2) +
            Math.pow(transformedPath[transformedPath.length - 1][1] - transformedPath[0][1], 2)
        ) / pathLengthInMiles;

    return (
        <div className="bg-card_blue-100 bg-opacity-30 rounded-xl p-4 mb-4 w-full">
            <svg className="w-full aspect-[2/1]" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                <g className="grid-lines" stroke="#3B82F680" strokeWidth="0.5">
                    {[...Array(Math.floor(height / gridSize))].map((_, i) => (
                        <line
                            key={`h${i}`}
                            x1="0"
                            y1={i * gridSize}
                            x2={width}
                            y2={i * gridSize}
                            strokeDasharray="2,2"
                        />
                    ))}
                    {[...Array(Math.floor(width / gridSize))].map((_, i) => (
                        <line
                            key={`v${i}`}
                            x1={i * gridSize}
                            y1="0"
                            x2={i * gridSize}
                            y2={height}
                            strokeDasharray="2,2"
                        />
                    ))}
                </g>

                {/* Scale bar */}
                <g transform={`translate(${padding}, ${height + 15})`}>
                    <line x1="0" y1="0" x2={pixelsPerMile} y2="0" stroke="#d1d1d1" strokeWidth="2" />
                    <line x1="0" y1="-3" x2="0" y2="3" stroke="#d1d1d1" strokeWidth="2" />
                    <line x1={pixelsPerMile} y1="-3" x2={pixelsPerMile} y2="3" stroke="#d1d1d1" strokeWidth="2" />
                    <text x={pixelsPerMile / 2} y="15" textAnchor="middle" fill="#d1d1d1" className="text-xs">
                        1 mile
                    </text>
                </g>

                {/* Path */}
                <path
                    d={`M ${transformedPath.map(([x, y]) => `${x},${y}`).join(' L ')}`}
                    stroke="#bdbdbd"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Circles at each coordinate */}
                {transformedPath.map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i === 0 || i === transformedPath.length - 1 ? 4 : 2}
                        fill={i === 0 ? '#d1d1d1' : i === transformedPath.length - 1 ? '#d1d1d1' : '#bdbdbd'}
                    />
                ))}
            </svg>
        </div>
    );
};

// We can define a type for the icon component from lucide-react:
type LucideIconComponent = React.ComponentType<LucideProps>;

interface MetricWidgetProps {
    icon: LucideIconComponent;
    label: string;
    value: string;
}

const MetricWidget: FC<MetricWidgetProps> = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center bg-card_blue-100 bg-opacity-30 rounded-lg p-3">
        <Icon size={20} className="text-phyt_text mb-1" />
        <span className="text-sm text-phyt_text_secondary">{label}</span>
        <span className="text-phyt_text font-semibold">{value}</span>
    </div>
);

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton: FC<TabButtonProps> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={cn(
            'px-6 py-3 text-lg font-inter transition-colors duration-200 flex-1 text-center',
            isActive ? 'text-phyt_text border-phyt_text_third' : 'text-phyt_text_third hover:text-phyt_text'
        )}
    >
        {children}
    </button>
);

export const Feed: FC = () => {
    const [activeTab, setActiveTab] = useState<'following' | 'trending'>('following');

    return (
        <div className="flex-1 overflow-y-auto h-screen">
            <div className="max-w-2xl mx-auto px-4">
                <div className="rounded-xl overflow-hidden">
                    <div>
                        <div className="flex gap-8">
                            <TabButton isActive={activeTab === 'following'} onClick={() => setActiveTab('following')}>
                                Following
                            </TabButton>
                            <TabButton isActive={activeTab === 'trending'} onClick={() => setActiveTab('trending')}>
                                Trending
                            </TabButton>
                        </div>
                    </div>

                    <div className="space-y-2 ">
                        {mockPosts.map((post) => (
                            <div key={post.id} className="card-wrapper min-h-[610px]">
                                <div className="card-content">
                                    <div className="rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={post.user.avatar}
                                                    alt={post.user.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="text-phyt_text font-semibold">{post.user.name} <span className="text-phyt_text_secondary">| RUNNER</span></h3>
                                                    <p className="text-phyt_text_secondary text-sm">{post.time}</p>
                                                </div>
                                            </div>
                                            <button className="text-phyt_text_secondary hover:text-phyt_text">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </div>

                                        <p className="text-phyt_text mb-4">{post.content}</p>

                                        <RunMap coordinates={post.runData.coordinates} distance={post.runData.distance} />

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <MetricWidget icon={Ruler} label="Distance" value={`${post.runData.distance} mi`} />
                                            <MetricWidget icon={Timer} label="Pace" value={`${post.runData.pace} /mi`} />
                                            <MetricWidget icon={Navigation} label="Time" value={post.runData.time} />
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-phyt_form">
                                            <button className="flex items-center gap-2 text-phyt_text_secondary hover:text-phyt_blue">
                                                <Heart size={20} />
                                                <span>{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-phyt_text_secondary hover:text-phyt_blue">
                                                <MessageCircle size={20} />
                                                <span>{post.comments}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-phyt_text_secondary hover:text-phyt_blue">
                                                <Share2 size={20} />
                                                <span>{post.shares}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
