// 'use client';

// import { Skeleton } from '@/components/ui/skeleton';
// import { useGetPosts, useDeletePost } from '@/hooks/use-posts';
// import { useToggleReaction } from '@/hooks/use-reactions';
// import { cn } from '@/lib/utils';

// import Image from 'next/image';
// import React, { useState } from 'react';

// import { formatDistanceToNow } from 'date-fns';
// import {
//     Heart,
//     MessageCircle,
//     Share2,
//     MoreHorizontal,
//     Timer,
//     Navigation,
//     Ruler,
//     ArrowDown,
//     TrendingUp
// } from 'lucide-react';

// type PostFilter = 'all' | 'following' | 'trending';

// const DEFAULT_AVATAR =
//     'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

// // Format time in mm:ss or hh:mm:ss
// const formatTime = (seconds: number): string => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const remainingSeconds = seconds % 60;

//     if (hours > 0) {
//         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
//     }

//     return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
// };

// // Format pace in min:sec per mile or km
// const formatPace = (paceInSeconds: number | null): string => {
//     if (!paceInSeconds) return '--:--';

//     const minutes = Math.floor(paceInSeconds / 60);
//     const seconds = Math.floor(paceInSeconds % 60);

//     return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
// };

// // Convert distance from meters to miles or kilometers
// const formatDistance = (distanceInMeters: number): string => {
//     const distanceInMiles = distanceInMeters / 1609.34;
//     return `${distanceInMiles.toFixed(2)} mi`;
// };

// interface TabProps {
//     label: string;
//     isActive: boolean;
//     onClick: () => void;
//     icon?: React.ReactNode;
// }

// const Tab = ({ label, isActive, onClick, icon }: TabProps) => (
//     <button
//         onClick={onClick}
//         className={`flex items-center gap-2 px-6 pb-2 text-2xl transition-colors duration-200 ${
//             isActive ? 'text-white' : 'text-text-dim hover:text-text'
//         }`}
//     >
//         {icon}
//         {label}
//     </button>
// );

// interface RunMapProps {
//     gpsRouteData?: string | null;
//     distanceInMeters: number;
// }

// const RunMap: React.FC<RunMapProps> = ({ gpsRouteData, distanceInMeters }) => {
//     // Default coordinates if no GPS data
//     const defaultCoordinates: [number, number][] = [
//         [0, 0],
//         [20, 15],
//         [40, 25],
//         [60, 40],
//         [80, 30],
//         [100, 45]
//     ];

//     // Parse GPS route data if provided
//     const coordinates = gpsRouteData
//         ? (JSON.parse(gpsRouteData) as [number, number][])
//         : defaultCoordinates;

//     const padding = 20;
//     const scaleBarHeight = 30;
//     const width = 400;
//     const height = 200 - scaleBarHeight;

//     const xValues = coordinates.map(([x]) => x);
//     const yValues = coordinates.map(([, y]) => y);
//     const minX = Math.min(...xValues);
//     const maxX = Math.max(...xValues);
//     const minY = Math.min(...yValues);
//     const maxY = Math.max(...yValues);

//     const xScale = (width - padding * 2) / (maxX - minX || 1);
//     const yScale = (height - padding * 2) / (maxY - minY || 1);
//     const scale = Math.min(xScale, yScale);

//     const transformedPath = coordinates.map(([x, y]) => [
//         padding + ((x - minX) * scale || 0),
//         padding + ((y - minY) * scale || 0)
//     ]);

//     const pathLengthInMiles = distanceInMeters / 1609.34;
//     const pixelsPerMile =
//         Math.sqrt(
//             Math.pow(
//                 transformedPath[transformedPath.length - 1][0] -
//                     transformedPath[0][0],
//                 2
//             ) +
//                 Math.pow(
//                     transformedPath[transformedPath.length - 1][1] -
//                         transformedPath[0][1],
//                     2
//                 )
//         ) / (pathLengthInMiles || 1);

//     return (
//         <div className="w-full p-4 mb-4 backdrop-blur-md rounded-xl">
//             <svg
//                 className="w-full aspect-[2/1]"
//                 viewBox="0 0 400 200"
//                 preserveAspectRatio="xMidYMid meet"
//             >
//                 <g
//                     className="grid-lines"
//                     stroke="rgba(59, 130, 246, 0.4)"
//                     strokeWidth="0.7"
//                 >
//                     {Array.from({ length: Math.floor(height / 20) }).map(
//                         (_, i) => (
//                             <line
//                                 key={`h${String(i)}`}
//                                 x1="0"
//                                 y1={i * 20}
//                                 x2={width}
//                                 y2={i * 20}
//                                 strokeDasharray="2,2"
//                             />
//                         )
//                     )}
//                     {Array.from({ length: Math.floor(width / 20) }).map(
//                         (_, i) => (
//                             <line
//                                 key={`v${String(i)}`}
//                                 x1={i * 20}
//                                 y1="0"
//                                 x2={i * 20}
//                                 y2={height}
//                                 strokeDasharray="2,2"
//                             />
//                         )
//                     )}
//                 </g>

//                 <g
//                     transform={`translate(${String(padding)}, ${String(height + 15)})`}
//                 >
//                     <line
//                         x1="0"
//                         y1="0"
//                         x2={pixelsPerMile}
//                         y2="0"
//                         stroke="#d1d1d1"
//                         strokeWidth="2"
//                     />
//                     <line
//                         x1="0"
//                         y1="-3"
//                         x2="0"
//                         y2="3"
//                         stroke="#d1d1d1"
//                         strokeWidth="2"
//                     />
//                     <line
//                         x1={pixelsPerMile}
//                         y1="-3"
//                         x2={pixelsPerMile}
//                         y2="3"
//                         stroke="#d1d1d1"
//                         strokeWidth="2"
//                     />
//                     <text
//                         x={pixelsPerMile / 2}
//                         y="15"
//                         textAnchor="middle"
//                         fill="#d1d1d1"
//                         className="text-xs"
//                     >
//                         1 mile
//                     </text>
//                 </g>

//                 <path
//                     d={`M ${transformedPath.map(([x, y]) => `${String(x)},${String(y)}`).join(' L ')}`}
//                     stroke="#0EF9FE"
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     fill="none"
//                 />

//                 {transformedPath.map(([x, y], i) => (
//                     <circle
//                         key={i}
//                         cx={x}
//                         cy={y}
//                         r={i === 0 || i === transformedPath.length - 1 ? 4 : 2}
//                         fill={
//                             i === 0
//                                 ? '#0EF9FE'
//                                 : i === transformedPath.length - 1
//                                   ? '#0EF9FE'
//                                   : '#0EF9FE'
//                         }
//                     />
//                 ))}
//             </svg>
//         </div>
//     );
// };

// interface MetricWidgetProps {
//     icon: React.ElementType;
//     label: string;
//     value: string;
// }

// const MetricWidget: React.FC<MetricWidgetProps> = ({
//     icon: Icon,
//     label,
//     value
// }) => (
//     <div className="flex flex-col items-center p-3 backdrop-blur-md">
//         <Icon size={20} className="mb-1 text-primary-shade" />
//         <span className="text-sm text-text-dim">{label}</span>
//         <span className="font-semibold text-text">{value}</span>
//     </div>
// );

// interface PostSkeletonProps {
//     count?: number;
// }

// const PostSkeleton: React.FC<PostSkeletonProps> = ({ count = 1 }) => (
//     <>
//         {Array.from({ length: count }).map((_, index) => (
//             <div key={index} className="p-6 border-b border-white/10">
//                 <div className="flex items-center gap-4 mb-4">
//                     <Skeleton className="w-10 h-10 rounded-full" />
//                     <div className="space-y-2">
//                         <Skeleton className="w-32 h-4" />
//                         <Skeleton className="w-24 h-3" />
//                     </div>
//                 </div>
//                 <Skeleton className="w-full h-48 mb-4" />
//                 <div className="grid grid-cols-3 gap-4 mb-4">
//                     <Skeleton className="w-full h-16" />
//                     <Skeleton className="w-full h-16" />
//                     <Skeleton className="w-full h-16" />
//                 </div>
//                 <div className="flex justify-between">
//                     <Skeleton className="w-20 h-8" />
//                     <Skeleton className="w-20 h-8" />
//                     <Skeleton className="w-20 h-8" />
//                 </div>
//             </div>
//         ))}
//     </>
// );

// export const Feed: React.FC = () => {
//     const [activeTab, setActiveTab] = useState<PostFilter>('all');
//     const { data, isLoading, isError } = useGetPosts({ filter: activeTab });
//     const toggleReaction = useToggleReaction();
//     const deletePost = useDeletePost();

//     return (
//         <div className="w-full">
//             <div className="flex items-center">
//                 <Tab
//                     label="All"
//                     isActive={activeTab === 'all'}
//                     onClick={() => {
//                         setActiveTab('all');
//                     }}
//                     icon={<ArrowDown size={24} />}
//                 />
//                 <div className="w-[2px] h-8 mx-1 bg-white/20"></div>
//                 <Tab
//                     label="Trending"
//                     isActive={activeTab === 'trending'}
//                     onClick={() => {
//                         setActiveTab('trending');
//                     }}
//                     icon={<TrendingUp size={24} />}
//                 />
//                 <div className="w-[2px] h-8 mx-1 bg-white/20"></div>
//                 <Tab
//                     label="Following"
//                     isActive={activeTab === 'following'}
//                     onClick={() => {
//                         setActiveTab('following');
//                     }}
//                     icon={<Heart size={24} />}
//                 />
//             </div>

//             {/* Posts */}
//             {isLoading ? (
//                 <PostSkeleton count={3} />
//             ) : isError ? (
//                 <div className="p-6 text-center text-text-dim">
//                     Failed to load posts. Please try again later.
//                 </div>
//             ) : data?.posts.length === 0 ? (
//                 <div className="p-6 text-center text-text-dim">
//                     No posts found.{' '}
//                     {activeTab === 'following'
//                         ? 'Try following some runners!'
//                         : ''}
//                 </div>
//             ) : (
//                 data?.posts.map((postData) => {
//                     const post = postData.post;
//                     const user = postData.user;
//                     const run = postData.run;
//                     const stats = postData.stats;

//                     const timeAgo = formatDistanceToNow(
//                         new Date(post.createdAt),
//                         { addSuffix: true }
//                     );

//                     return (
//                         <div
//                             key={post.id}
//                             className="overflow-hidden transition-colors border-b cursor-pointer border-white/10 hover:bg-black/10 duration-400"
//                         >
//                             <div className="p-6">
//                                 {/* Post header */}
//                                 <div className="flex items-center justify-between mb-4">
//                                     <div className="flex items-center gap-5">
//                                         <Image
//                                             src={
//                                                 user.avatarUrl ?? DEFAULT_AVATAR
//                                             }
//                                             alt={user.username}
//                                             width={40}
//                                             height={40}
//                                             className="rounded-full"
//                                         />
//                                         <div>
//                                             <div className="flex items-center">
//                                                 <h3 className="text-text">
//                                                     {user.username}
//                                                 </h3>
//                                                 <div className="w-px h-6 mx-4 bg-white/20"></div>
//                                                 <p className="text-text-dim">
//                                                     RUNNER
//                                                 </p>
//                                             </div>
//                                             <p className="text-sm text-text-dim">
//                                                 {timeAgo}
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <button className="p-2 transition-colors rounded-full text-text-dim hover:text-text hover:bg-white/5">
//                                         <MoreHorizontal size={20} />
//                                     </button>
//                                 </div>

//                                 {/* Run Map */}
//                                 <RunMap
//                                     gpsRouteData={run.gpsRouteData}
//                                     distanceInMeters={run.distance}
//                                 />

//                                 {/* Metrics */}
//                                 <div className="grid grid-cols-3 gap-4 mb-4">
//                                     <MetricWidget
//                                         icon={Ruler}
//                                         label="Distance"
//                                         value={formatDistance(run.distance)}
//                                     />
//                                     <MetricWidget
//                                         icon={Timer}
//                                         label="Pace"
//                                         value={`${formatPace(run.averagePaceSec)} /mi`}
//                                     />
//                                     <MetricWidget
//                                         icon={Navigation}
//                                         label="Time"
//                                         value={formatTime(run.durationSeconds)}
//                                     />
//                                 </div>

//                                 {/* Actions */}
//                                 <div className="flex items-center justify-between pt-1">
//                                     {/* <button
//                                         className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-rose-600 hover:bg-rose-600/5"
//                                         onClick={() => handleLike(post.id)}
//                                     >
//                                         <Heart size={20} />
//                                         <span>{stats.likes || 0}</span>
//                                     </button> */}
//                                     <button className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-primary-shade hover:bg-primary-faded">
//                                         <MessageCircle size={20} />
//                                         <span>{stats.comments || 0}</span>
//                                     </button>
//                                     <button className="flex items-center gap-2 p-2 transition-colors rounded-full text-text-dim hover:text-emerald-500 hover:bg-emerald-500/5">
//                                         <Share2 size={20} />
//                                         <span>0</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })
//             )}

//             {/* Pagination */}
//             {data?.pagination && data.pagination.totalPages > 1 && (
//                 <div className="flex justify-center mt-6 gap-2">
//                     {Array.from({ length: data.pagination.totalPages }).map(
//                         (_, i) => (
//                             <button
//                                 key={i}
//                                 className={cn(
//                                     'w-8 h-8 rounded-full flex items-center justify-center',
//                                     data.pagination?.page === i + 1
//                                         ? 'bg-primary text-black'
//                                         : 'bg-gray-800 text-white hover:bg-gray-700'
//                                 )}
//                             >
//                                 {i + 1}
//                             </button>
//                         )
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Feed;
