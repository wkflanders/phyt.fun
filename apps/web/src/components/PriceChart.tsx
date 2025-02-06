import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type PriceHistoryEntry = {
    timestamp: string;
    price: number;
};

interface PriceChartProps {
    listings: Array<{
        listing: {
            price: string;
            created_at: string;
        };
    }>;
}

const PriceChart = ({ listings }: PriceChartProps) => {
    const chartData = listings
        .map(listing => ({
            timestamp: new Date(listing.listing.created_at).toLocaleString(),
            price: Number(listing.listing.price)
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
        <Card className="bg-black border-gray-800">
            <CardHeader>
                <CardTitle className="text-white text-sm">Price History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="timestamp"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                domain={['dataMin', 'dataMax']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '6px'
                                }}
                                labelStyle={{ color: '#9CA3AF' }}
                                itemStyle={{ color: '#60A5FA' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#60A5FA"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default PriceChart;