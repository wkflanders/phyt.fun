import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Timer, Navigation, Ruler } from 'lucide-react';

const mockPosts = [
    {
        id: 1,
        user: {
            name: 'boatsandlogs',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFzH1tTYSPrsGziypw0WOcRQSY1DebF2V6ATHX'
        },
        content: 'lightwork',
        runData: {
            coordinates: [
                [0, 0],
                [20, 15],
                [40, 25],
                [60, 40],
                [80, 30],
                [100, 45]
            ],
            distance: '5.2',
            pace: '8:30',
            time: '44:12'
        },
        likes: 124,
        comments: 18,
        shares: 5,
        time: '2h ago'
    },
    {
        id: 2,
        user: {
            name: 'jc9923',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut'
        },
        content: "Quick morning jog",
        runData: {
            coordinates: [
                [10, 10],
                [30, 40],
                [50, 30],
                [70, 50],
                [90, 35]
            ],
            distance: '3.1',
            pace: '7:45',
            time: '24:05'
        },
        likes: 89,
        comments: 12,
        shares: 3,
        time: '4h ago'
    },
    {
        id: 3,
        user: {
            name: 'rob11121',
            avatar: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFvL3WgyBlUwOnrYHhoyXe7VEfG4udaTSLBDkK'
        },
        content: '',
        runData: {
            coordinates: [
                [5, 5],
                [25, 35],
                [45, 25],
                [65, 45],
                [85, 30]
            ],
            distance: '6.8',
            pace: '9:15',
            time: '1:02:54'
        },
        likes: 56,
        comments: 8,
        shares: 2,
        time: '6h ago'
    }
];

const RunMap = ({ coordinates, distance }) => {
    // Scale coordinates to fit SVG viewport while maintaining aspect ratio
    const padding = 20; // Reduced padding
    const scaleBarHeight = 30; // Height reserved for scale bar
    const width = 400;
    const height = 200 - scaleBarHeight;

    // Find bounds
    const xValues = coordinates.map(([x]) => x);
    const yValues = coordinates.map(([, y]) => y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    // Calculate scales with padding consideration
    const xScale = (width - (padding * 2)) / (maxX - minX);
    const yScale = (height - (padding * 2)) / (maxY - minY);
    const scale = Math.min(xScale, yScale);

    // Transform coordinates
    const transformedPath = coordinates.map(([x, y]) => [
        padding + ((x - minX) * scale),
        padding + ((y - minY) * scale)
    ]);

    // Calculate grid spacing
    const gridSize = 20;
    const numHorizontalLines = Math.floor(height / gridSize);
    const numVerticalLines = Math.floor(width / gridSize);

    // Calculate scale bar length (1 mile)
    const pathLengthInMiles = parseFloat(distance);
    const pixelsPerMile = Math.sqrt(
        Math.pow(transformedPath[transformedPath.length - 1][0] - transformedPath[0][0], 2) +
        Math.pow(transformedPath[transformedPath.length - 1][1] - transformedPath[0][1], 2)
    ) / pathLengthInMiles;

    return (
        <div className="bg-phyt_form bg-opacity-10 rounded-xl p-4 mb-4 w-full">
            <svg className="w-full aspect-[2/1]" viewBox={`0 0 400 200`} preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
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
                    <line
                        x1="0"
                        y1="0"
                        x2={pixelsPerMile}
                        y2="0"
                        stroke="#3B82F6"
                        strokeWidth="2"
                    />
                    <line
                        x1="0"
                        y1="-3"
                        x2="0"
                        y2="3"
                        stroke="#3B82F6"
                        strokeWidth="2"
                    />
                    <line
                        x1={pixelsPerMile}
                        y1="-3"
                        x2={pixelsPerMile}
                        y2="3"
                        stroke="#3B82F6"
                        strokeWidth="2"
                    />
                    <text
                        x={pixelsPerMile / 2}
                        y="15"
                        textAnchor="middle"
                        fill="#3B82F6"
                        className="text-xs"
                    >
                        1 mile
                    </text>
                </g>

                {/* Route path */}
                <path
                    d={`M ${transformedPath.map(([x, y]) => `${x},${y}`).join(' L ')}`}
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />

                {/* Route points */}
                {transformedPath.map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i === 0 || i === transformedPath.length - 1 ? 4 : 2}
                        fill={i === 0 ? '#22C55E' : i === transformedPath.length - 1 ? '#EF4444' : '#3B82F6'}
                    />
                ))}
            </svg>
        </div>
    );
};

const MetricWidget = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col items-center bg-phyt_form bg-opacity-10 rounded-lg p-3">
        <Icon size={20} className="text-phyt_blue mb-1" />
        <span className="text-sm text-phyt_text_secondary">{label}</span>
        <span className="text-phyt_text font-semibold">{value}</span>
    </div>
);

export const Feed = () => {
    return (
        <div className="fixed inset-0 overflow-y-auto">
            <div className="max-w-2xl mx-auto py-6 px-4">
                <div className="space-y-6">
                    {mockPosts.map(post => (
                        <div key={post.id} className="bg-black rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={post.user.avatar}
                                        alt={post.user.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <h3 className="text-phyt_text font-semibold">{post.user.name}</h3>
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
                                <MetricWidget
                                    icon={Ruler}
                                    label="Distance"
                                    value={`${post.runData.distance} mi`}
                                />
                                <MetricWidget
                                    icon={Timer}
                                    label="Pace"
                                    value={`${post.runData.pace} /mi`}
                                />
                                <MetricWidget
                                    icon={Navigation}
                                    label="Time"
                                    value={post.runData.time}
                                />
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
                    ))}
                </div>
            </div>
        </div>
    );
};