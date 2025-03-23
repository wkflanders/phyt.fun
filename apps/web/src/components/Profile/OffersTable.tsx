import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { User } from '@phyt/types';

interface OffersTableProps {
    user: User;
}

export const OffersTable: React.FC<OffersTableProps> = ({ user }) => {
    return (
        <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-card/30 flex justify-between items-center">
                <h3 className="text-text font-medium">Offers</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-text-dim">
                        Filter
                    </Button>
                    <Select defaultValue="received">
                        <SelectTrigger className="h-8 bg-form border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="received">Received</SelectItem>
                            <SelectItem value="made">Made</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-white/10">
                        <tr className="text-text-dim text-xs">
                            <th className="py-3 px-4 text-left">Item</th>
                            <th className="py-3 px-4 text-left">Price</th>
                            <th className="py-3 px-4 text-left">USD Price</th>
                            <th className="py-3 px-4 text-left">Floor Difference</th>
                            <th className="py-3 px-4 text-left">Expiration</th>
                            <th className="py-3 px-4 text-left">From</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-white/10">
                            <td className="py-4 px-4 flex items-center">
                                <div className="w-10 h-10 bg-card rounded-md mr-3 overflow-hidden">
                                    <Image
                                        src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFiX7F91C2bX4B8g2Mc6KhofFQwlZiOsIytUV5"
                                        alt="Item"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-text">Farm Land #1400</div>
                                    <div className="text-text-dim text-xs">Pixels - Farm Land</div>
                                </div>
                            </td>
                            <td className="py-4 px-4 text-text">0.10 ETH</td>
                            <td className="py-4 px-4 text-text-dim">$243.86</td>
                            <td className="py-4 px-4 text-text-dim">7% below</td>
                            <td className="py-4 px-4 text-text-dim">in 2 days</td>
                            <td className="py-4 px-4 text-text">BidderXYZ</td>
                            <td className="py-4 px-4">
                                <div className="flex gap-2">
                                    <Button size="sm" className="bg-primary text-black hover:bg-primary/90">Accept</Button>
                                    <Button size="sm" variant="outline">Decline</Button>
                                </div>
                            </td>
                        </tr>
                        {/* You can add more offers here */}
                    </tbody>
                </table>
            </div>
        </div>
    );
};