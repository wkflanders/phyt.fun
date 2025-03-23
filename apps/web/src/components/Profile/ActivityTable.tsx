import React from 'react';
import { Button } from '@/components/ui/button';
import { Tag, Activity as ActivityIcon } from 'lucide-react';
import { User } from '@phyt/types';

interface ActivityTableProps {
    user: User;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({ user }) => {
    // Mock activity data - in a real app you'd fetch this from an API
    const ActivityData = [
        { type: 'listing', item: 'HYTOPIA World #8438', price: '0.6299 ETH', time: '3 days ago' },
        { type: 'purchase', item: 'Farm Land #1400', price: '0.47 ETH', time: '1 week ago' },
        { type: 'sale', item: 'Medium Apartment', price: '0.10 ETH', time: '2 weeks ago' },
    ];

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-card/30 flex justify-between items-center">
                <h3 className="text-text font-medium">Recent Activity</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-text-dim">
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="text-text-dim">
                        Event Types
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-white/10">
                        <tr className="text-text-dim text-xs">
                            <th className="py-3 px-4 text-left">Event</th>
                            <th className="py-3 px-4 text-left">Item</th>
                            <th className="py-3 px-4 text-left">Price</th>
                            <th className="py-3 px-4 text-left">From</th>
                            <th className="py-3 px-4 text-left">To</th>
                            <th className="py-3 px-4 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ActivityData.map((activity, index) => (
                            <tr key={index} className="border-b border-white/10 hover:bg-card/30">
                                <td className="py-4 px-4 flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                        {activity.type === 'listing' ? <Tag size={16} /> :
                                            activity.type === 'purchase' ? <ActivityIcon size={16} /> :
                                                <Tag size={16} />}
                                    </span>
                                    <span className="capitalize">{activity.type}</span>
                                </td>
                                <td className="py-4 px-4 text-text">{activity.item}</td>
                                <td className="py-4 px-4 text-text">{activity.price}</td>
                                <td className="py-4 px-4 text-text">
                                    {activity.type === 'purchase' ? 'Marketplace' : user.username}
                                </td>
                                <td className="py-4 px-4 text-text">
                                    {activity.type === 'sale' ? 'Marketplace' : user.username}
                                </td>
                                <td className="py-4 px-4 text-text-dim">{activity.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};