'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Timer, Navigation, Ruler } from 'lucide-react';
import Image from 'next/image';

// Types remain the same
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

// Mock data remains the same
const mockPosts: Post[] = [
    {
        id: 1,
        user: {
            name: 'gphyt',
            avatar: 'https://d1za1h12no9co6.cloudfront.net/00f5c89d-465c-4414-a22f-ccbfd1003e7a.png',
        },
        content: 'lightwork',
        runData: {
            coordinates: [[0, 0], [20, 15], [40, 25], [60, 40], [80, 30], [100, 45]],
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
            coordinates: [[10, 10], [30, 40], [50, 30], [70, 50], [90, 35]],
            distance: '3.1',
            pace: '7:45',
            time: '24:05',
        },
        likes: 89,
        comments: 12,
        shares: 3,
        time: '4h ago',
    },
];

// Tab interface
interface TabProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => (
    <button
        onClick={onClick}
        className={`px-6 py-4 text-2xl transition-colors text-text-dim duration-200 ${isActive
            ? 'text-white'
            : 'text-text-dim hover:text-text'
            }`}
    >
        {label}
    </button>
);

const RunMap = ({ coordinates, distance }: { coordinates: Array<[number, number]>; distance: string; }) => {
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

    const pathLengthInMiles = parseFloat(distance);
    const pixelsPerMile = Math.sqrt(
        Math.pow(transformedPath[transformedPath.length - 1][0] - transformedPath[0][0], 2) +
        Math.pow(transformedPath[transformedPath.length - 1][1] - transformedPath[0][1], 2)
    ) / pathLengthInMiles;

    return (
        <div className="w-full p-4 mb-4 backdrop-blur-md rounded-xl">
            <svg className="w-full aspect-[2/1]" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
                <g className="grid-lines" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="0.7">
                    {[...Array(Math.floor(height / 20))].map((_, i) => (
                        <line
                            key={`h${i}`}
                            x1="0"
                            y1={i * 20}
                            x2={width}
                            y2={i * 20}
                            strokeDasharray="2,2"
                        />
                    ))}
                    {[...Array(Math.floor(width / 20))].map((_, i) => (
                        <line
                            key={`v${i}`}
                            x1={i * 20}
                            y1="0"
                            x2={i * 20}
                            y2={height}
                            strokeDasharray="2,2"
                        />
                    ))}
                </g>

                <g transform={`translate(${padding}, ${height + 15})`}>
                    <line x1="0" y1="0" x2={pixelsPerMile} y2="0" stroke="#d1d1d1" strokeWidth="2" />
                    <line x1="0" y1="-3" x2="0" y2="3" stroke="#d1d1d1" strokeWidth="2" />
                    <line x1={pixelsPerMile} y1="-3" x2={pixelsPerMile} y2="3" stroke="#d1d1d1" strokeWidth="2" />
                    <text x={pixelsPerMile / 2} y="15" textAnchor="middle" fill="#d1d1d1" className="text-xs">
                        1 mile
                    </text>
                </g>

                <path
                    d={`M ${transformedPath.map(([x, y]) => `${x},${y}`).join(' L ')}`}
                    stroke="#0EF9FE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {transformedPath.map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i === 0 || i === transformedPath.length - 1 ? 4 : 2}
                        fill={i === 0 ? '#0EF9FE' : i === transformedPath.length - 1 ? '#0EF9FE' : '#0EF9FE'}
                    />
                ))}
            </svg>
        </div>
    );
};

const MetricWidget = ({ icon: Icon, label, value }: { icon: any; label: string; value: string; }) => (
    <div className="flex flex-col items-center p-3 backdrop-blur-md">
        <Icon size={20} className="mb-1 text-primary-shade" />
        <span className="text-sm text-text-dim">{label}</span>
        <span className="font-semibold text-text">{value}</span>
    </div>
);

export const Feed = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>('all');

    return (
        <div className="w-full">
            <div className="flex items-center">
                <Tab
                    label="All"
                    isActive={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                />
                <div className="w-[2px] h-8 mx-1 bg-white/20"></div>
                <Tab
                    label="Trending"
                    isActive={activeTab === 'trending'}
                    onClick={() => setActiveTab('trending')}
                />
                <div className="w-[2px] h-8 mx-1 bg-white/20"></div>
                <Tab
                    label="Following"
                    isActive={activeTab === 'following'}
                    onClick={() => setActiveTab('following')}
                />
            </div>

            {/* Posts */}
            {mockPosts.map((post) => (
                <div key={post.id} className="overflow-hidden transition-colors border-b cursor-pointer border-white/10 hover:bg-black/10 duration-400">
                    <div className="p-6">
                        {/* Post header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-5">
                                <Image
                                    src={post.user.avatar}
                                    alt={post.user.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="text-text">
                                            {post.user.name}
                                        </h3>
                                        <div className="w-px h-6 mx-4 bg-white/20"></div>
                                        <p className="text-text-dim">RUNNER</p>
                                    </div>
                                    <p className="text-sm text-text-dim">{post.time}</p>
                                </div>
                            </div>
                            <button className="p-2 transition-colors rounded-full text-text-dim hover:text-text hover:bg-white/5">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                        <RunMap coordinates={post.runData.coordinates} distance={post.runData.distance} />

                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <MetricWidget icon={Ruler} label="Distance" value={`${post.runData.distance} mi`} />
                            <MetricWidget icon={Timer} label="Pace" value={`${post.runData.pace} /mi`} />
                            <MetricWidget icon={Navigation} label="Time" value={post.runData.time} />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <button className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-rose-600 hover:bg-rose-600/5">
                                <Heart size={20} />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-primary-shade hover:bg-primary-faded">
                                <MessageCircle size={20} />
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-emerald-500 hover:bg-emerald-500/5">
                                <Share2 size={20} />
                                <span>{post.shares}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Feed;