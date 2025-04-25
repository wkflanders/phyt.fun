import { User, CardWithMetadata } from '@phyt/types';
import { Copy, Check } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { ProfileStats } from './ProfileStats';

interface ProfileHeaderProps {
    user: User | undefined;
    cards: CardWithMetadata[];
}

const DEFAULT_AVATAR =
    'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    cards
}) => {
    const [copied, setCopied] = useState(false);

    const walletAddress = user?.walletAddress
        ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`
        : 'Error fetching wallet';

    const handleCopy = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }
    };

    return (
        <div className="relative">
            <div className="h-96 w-full bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30"></div>
            <div className="absolute inset-0 px-6 py-4 flex justify-between">
                <div className="flex items-end">
                    <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        <Image
                            src={user?.avatarUrl ?? DEFAULT_AVATAR}
                            alt={user?.username ?? 'User'}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="ml-6 mb-4">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-3xl font-bold">
                                {user?.username}
                            </h1>
                            <button
                                onClick={handleCopy}
                                className="pl-2 text-text-dim hover:text-text"
                            >
                                {copied ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <Copy className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-3 mt-4 text-sm">
                            <span className="px-3 py-1 bg-zinc-800/40 text-white-dim border border-white/10">
                                Joined{' '}
                                {user?.createdAt
                                    ? new Date(
                                          user.createdAt
                                      ).toLocaleDateString('en-US', {
                                          month: 'short',
                                          year: 'numeric'
                                      })
                                    : 'Unknown'}
                            </span>
                            <span className="px-3 py-1 bg-zinc-800/40 text-white-dim border border-white/10">
                                {walletAddress}
                            </span>
                            <span className="px-3 py-1 bg-zinc-800/40 text-white border border-white/10 flex items-center gap-2">
                                {user?.phytnessPoints ?? 0}
                                <Image
                                    src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFEiSLtcfUBum8Mgfo1FYyXsrLc3tahDp4Q2JS"
                                    alt="Phytness Points"
                                    width={10}
                                    height={11}
                                />
                            </span>
                            {user?.role === 'runner' && (
                                <span className="px-3 py-1 bg-zinc-800/40 text-white border border-primary/20">
                                    RUNNER
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-end">
                    <ProfileStats cards={cards} />
                </div>
            </div>
        </div>
    );
};
