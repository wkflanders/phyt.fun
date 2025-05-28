'use client';
import Image from 'next/image';
import React, { useState } from 'react';

import { Trophy, Medal, Timer, Activity, Wallet, Award, TrendingUp, Target } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type {LucideIcon} from 'lucide-react';

interface GamblerData {
  id: number;
  rank: number;
  username: string;
  avatar: string;
  totalPoints: number;
  earnings: number;
  winRate: string;
  competitionsEntered: number;
  successfulPicks: number;
}

interface RunnerData {
  id: number;
  rank: number;
  username: string;
  avatar: string;
  competitionsWon: number;
  bestMileTime: string;
  totalEarnings: number;
  averagePace: string;
  totalDistance: number;
  winRate: string;
}

interface HighlightItem {
  title: string;
  value: string;
  username: string;
  icon: LucideIcon;
}

type TimeFrame = 'weekly' | 'monthly' | 'allTime';
type BoardType = 'gamblers' | 'runners';

interface LeaderboardData {
  weekly: GamblerData[];
  monthly?: GamblerData[];
  allTime?: GamblerData[];
}

interface RunnerLeaderboardData {
  weekly: RunnerData[];
  monthly?: RunnerData[];
  allTime?: RunnerData[];
}

const DualLeaderboard = () => {
  const [activeBoard, setActiveBoard] = useState<BoardType>('gamblers');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');

  // Mock data with proper typing
  const gamblersData: LeaderboardData = {
    weekly: [
      {
        id: 1,
        rank: 1,
        username: "master_predictor",
        avatar: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        totalPoints: 15250,
        earnings: 3.8,
        winRate: "68%",
        competitionsEntered: 24,
        successfulPicks: 18
      },
      {
        id: 2,
        rank: 2,
        username: "pro_analyst",
        avatar: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        totalPoints: 12800,
        earnings: 2.9,
        winRate: "62%",
        competitionsEntered: 22,
        successfulPicks: 15
      }
    ]
  };

  const runnersData: RunnerLeaderboardData = {
    weekly: [
      {
        id: 1,
        rank: 1,
        username: "speed_demon",
        avatar: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        competitionsWon: 8,
        bestMileTime: "4:12",
        totalEarnings: 4.2,
        averagePace: "4:30",
        totalDistance: 156.2,
        winRate: "75%"
      },
      {
        id: 2,
        rank: 2,
        username: "marathon_master",
        avatar: "https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut",
        competitionsWon: 6,
        bestMileTime: "4:18",
        totalEarnings: 3.5,
        averagePace: "4:45",
        totalDistance: 142.8,
        winRate: "65%"
      }
    ]
  };

  const gamblerHighlights: HighlightItem[] = [
    {
      title: "Top Points Earner",
      value: "15,250 pts",
      username: "master_predictor",
      icon: Target
    },
    {
      title: "Highest Earnings",
      value: "3.8 ETH",
      username: "master_predictor",
      icon: Wallet
    },
    {
      title: "Best Win Rate",
      value: "68%",
      username: "master_predictor",
      icon: TrendingUp
    }
  ];

  const runnerHighlights: HighlightItem[] = [
    {
      title: "Most Wins",
      value: "8 competitions",
      username: "speed_demon",
      icon: Trophy
    },
    {
      title: "Best Mile Time",
      value: "4:12",
      username: "speed_demon",
      icon: Timer
    },
    {
      title: "Highest Distance",
      value: "156.2 km",
      username: "speed_demon",
      icon: Activity
    }
  ];

  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-400';
      default: return 'text-phyt_text_secondary';
    }
  };

  const getCurrentData = () => {
    if (activeBoard === 'gamblers') {
      return gamblersData[timeFrame]?.length ? gamblersData[timeFrame] : gamblersData.weekly;
    }
    return runnersData[timeFrame]?.length ? runnersData[timeFrame] : runnersData.weekly;
  };

  return (
    <div className="space-y-8">
      {/* Board Type Selection */}
      <div className="flex justify-center space-x-4">
        <button
          className={`px-6 py-3 rounded-lg font-semibold ${activeBoard === 'gamblers'
            ? 'bg-phyt_blue text-black'
            : 'bg-phyt_form text-phyt_text'
            }`}
          onClick={() => { setActiveBoard('gamblers'); }}
        >
          Gamblers
        </button>
        <button
          className={`px-6 py-3 rounded-lg font-semibold ${activeBoard === 'runners'
            ? 'bg-phyt_blue text-black'
            : 'bg-phyt_form text-phyt_text'
            }`}
          onClick={() => { setActiveBoard('runners'); }}
        >
          Runners
        </button>
      </div>

      {/* Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(activeBoard === 'gamblers' ? gamblerHighlights : runnerHighlights).map((highlight) => (
          <Card key={highlight.title} className="bg-phyt_form border-phyt_form_border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-phyt_text_secondary text-sm">{highlight.title}</p>
                  <p className="text-2xl font-bold text-phyt_text mt-1">{highlight.value}</p>
                  <p className="text-phyt_blue text-sm mt-1">{highlight.username}</p>
                </div>
                <highlight.icon className="text-phyt_blue h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time Frame Selection */}
      <div className="flex space-x-4 border-b border-phyt_form">
        {['weekly', 'monthly', 'allTime'].map((period) => (
          <button
            key={period}
            className={`pb-2 px-4 ${timeFrame === period
              ? 'text-phyt_blue border-b-2 border-phyt_blue'
              : 'text-phyt_text_secondary'
              }`}
            onClick={() => { setTimeFrame(period as TimeFrame); }}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card className="bg-phyt_form border-phyt_form_border">
        <CardHeader>
          <CardTitle className="text-xl text-phyt_text">
            {activeBoard === 'gamblers' ? 'Gambler Rankings' : 'Runner Rankings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-phyt_text_secondary text-left">
                  <th className="pb-4 pl-4">Rank</th>
                  <th className="pb-4">User</th>
                  {activeBoard === 'gamblers' ? (
                    <>
                      <th className="pb-4">Total Points</th>
                      <th className="pb-4">Win Rate</th>
                      <th className="pb-4">Competitions</th>
                      <th className="pb-4">Successful Picks</th>
                      <th className="pb-4 pr-4">Earnings</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-4">Competitions Won</th>
                      <th className="pb-4">Best Mile</th>
                      <th className="pb-4">Avg Pace</th>
                      <th className="pb-4">Distance</th>
                      <th className="pb-4 pr-4">Earnings</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {getCurrentData().map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-phyt_form_border hover:bg-black/20"
                  >
                    <td className="py-4 pl-4 flex items-center gap-2">
                      <Medal className={getMedalColor(user.rank)} size={20} />
                      <span className="text-phyt_text">{user.rank}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="text-phyt_text">{user.username}</span>
                      </div>
                    </td>
                    {activeBoard === 'gamblers' ? (
                      <>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as GamblerData).totalPoints.toLocaleString()}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{user.winRate}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as GamblerData).competitionsEntered}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as GamblerData).successfulPicks}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-phyt_blue font-semibold">{(user as GamblerData).earnings} ETH</span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as RunnerData).competitionsWon}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as RunnerData).bestMileTime}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as RunnerData).averagePace}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-phyt_text">{(user as RunnerData).totalDistance} km</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-phyt_blue font-semibold">{(user as RunnerData).totalEarnings} ETH</span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DualLeaderboard;