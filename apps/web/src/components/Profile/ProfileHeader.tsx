import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, CardWithMetadata } from '@phyt/types';

interface ProfileHeaderProps {
    user: User;
    userCards: CardWithMetadata[];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, userCards }) => {
    const [copied, setCopied] = useState(false);

    const walletAddress = user?.wallet_address
        ? `${user.wallet_address.substring(0, 6)}...${user.wallet_address.substring(user.wallet_address.length - 4)}`
        : 'Connect Wallet';

    const handleCopy = () => {
        if (user?.wallet_address) {
            navigator.clipboard.writeText(user.wallet_address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-20">
            {/* Avatar */}
            <div className="relative">
                <div className="w-36 h-36 rounded-full border-4 border-background overflow-hidden bg-card">
                    <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={144}
                        height={144}
                        className="object-cover"
                    />
                </div>
                {/* Edit avatar button */}
                <Button
                    variant="outline"
                    className="absolute bottom-1 right-1 rounded-full h-8 w-8 p-0 bg-black/50 border-white/20 hover:bg-black/70"
                >
                    <Settings size={14} />
                </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-text mb-1">{user.username}</h1>
                    {/* Verification badge if applicable */}
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-primary">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.5303 9.53033C16.8232 9.23744 16.8232 8.76256 16.5303 8.46967C16.2374 8.17678 15.7626 8.17678 15.4697 8.46967L10.5 13.4393L8.53033 11.4697C8.23744 11.1768 7.76256 11.1768 7.46967 11.4697C7.17678 11.7626 7.17678 12.2374 7.46967 12.5303L9.96967 15.0303C10.2626 15.3232 10.7374 15.3232 11.0303 15.0303L16.5303 9.53033Z" fill="white" />
                    </svg>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-text-dim mb-4">
                    <span>{walletAddress}</span>
                    <span className="text-text-dim">•</span>
                    <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    <span className="text-text-dim">•</span>
                    <span>{userCards.length || 0} items</span>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2">
                    {user.twitter_handle && (
                        <Link href={`https://twitter.com/${user.twitter_handle}`} target="_blank" aria-label="Twitter">
                            <Button variant="ghost" size="sm" className="rounded-full">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 text-text-dim">
                                    <path fill="currentColor" d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
                                </svg>
                            </Button>
                        </Link>
                    )}
                    <Link href="#" target="_blank" aria-label="Website">
                        <Button variant="ghost" size="sm" className="rounded-full">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-text-dim">
                                <path fill="currentColor" d="M21.41 8.64v-.05a10 10 0 0 0-18.78 0v.05a9.86 9.86 0 0 0 0 6.72v.05a10 10 0 0 0 18.78 0v-.05a9.86 9.86 0 0 0 0-6.72ZM4.26 14a7.82 7.82 0 0 1 0-4h1.86a16.73 16.73 0 0 0 0 4Zm.82 2h1.4a12.15 12.15 0 0 0 1 2.57A8 8 0 0 1 5.08 16Zm1.4-8h-1.4a8 8 0 0 1 2.37-2.57A12.15 12.15 0 0 0 6.48 8Zm4.71 11.92a5.23 5.23 0 0 1-2.35-2.92h2.35Zm0-4.92H7.9a14.16 14.16 0 0 1 0-4h3.29Zm0-6h-2.35a5.23 5.23 0 0 1 2.35-2.92Zm7.73 1a7.82 7.82 0 0 1 0 4h-1.86a16.73 16.73 0 0 0 0-4Zm-.82-2h-1.4a12.15 12.15 0 0 0-1-2.57A8 8 0 0 1 18.92 8Zm-4.71-3.92a5.23 5.23 0 0 1 2.35 2.92h-2.35Zm0 4.92h3.29a14.16 14.16 0 0 1 0 4h-3.29Zm0 9.92v-3.92h2.35a5.23 5.23 0 0 1-2.35 2.92Zm4.71-1a12.15 12.15 0 0 0 1-2.57h1.4a8 8 0 0 1-2.4 2.57Z" />
                            </svg>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-end mb-4">
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings size={16} />
                    <span className="hidden sm:inline">Edit Profile</span>
                </Button>
                <Button variant="outline" size="sm" className="p-2">
                    <MoreHorizontal size={16} />
                </Button>
            </div>
        </div>
    );
};