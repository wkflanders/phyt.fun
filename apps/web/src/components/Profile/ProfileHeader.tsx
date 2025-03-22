import React, { useState } from 'react';
import Image from 'next/image';
import { Copy, Check } from 'lucide-react';
import { ProfileStats } from './ProfileStats';

interface ProfileHeaderProps {
    address: string;
    joinDate: string;
    addressShort: string;
    xp: string;
    loyalty: string;
    avatarUrl: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    address = "0x5ed0...3c92",
    joinDate = "DEC 2024",
    addressShort = "5ED052",
    xp = "41 XP",
    loyalty = "LOYALTY 67.6%",
    avatarUrl,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="h-52 w-full bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30"></div>
            <div className="px-6 py-4 flex justify-between relative">
                <div className="flex items-end -mt-16">
                    <div className="bg-gradient-to-br from-primary-gradientStart to-secondary p-1 rounded-full">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            <Image
                                src={avatarUrl}
                                alt="Profile"
                                width={128}
                                height={128}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                    <div className="ml-6 mb-4">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-3xl font-bold">{address}</h1>
                            <button onClick={handleCopy} className="text-text-dim hover:text-text">
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-text-dim">
                            <span>JOINED {joinDate}</span>
                            <span>{addressShort}</span>
                            <span>{xp}</span>
                            <span>{loyalty}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-end mb-4">
                    <ProfileStats />
                </div>
            </div>
        </>
    );
};
