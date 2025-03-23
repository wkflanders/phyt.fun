import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const ProfileTabs: React.FC = () => {
    const pathname = usePathname();

    const tabs = [
        { href: '/profile', label: 'Items' },
        { href: '/profile/listings', label: 'Listings' },
        { href: '/profile/offers', label: 'Offers' },
        { href: '/profile/portfolio', label: 'Portfolio' },
        { href: '/profile/created', label: 'Created' },
        { href: '/profile/activity', label: 'Activity' }
    ];

    return (
        <div className="border-b border-border">
            <div className="flex px-6">
                {tabs.map((tab) => (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        className={cn(
                            "px-4 py-3 font-medium text-sm",
                            pathname === tab.href
                                ? "text-text border-b-2 border-text"
                                : "text-text-dim hover:text-text"
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>
        </div>
    );
};