import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const ProfileTabs: React.FC = () => {
    const pathname = usePathname();

    const tabs = [
        { href: '/profile', label: 'Items' },
        { href: '/profile/activity', label: 'Activity' },
        { href: '/profile/offers', label: 'Offers' },
        { href: '/profile/listings', label: 'Listings' },
        { href: '/profile/competitions', label: 'Competitions' },
        { href: '/profile/runs', label: 'Runs' },
        { href: '/profile/progress', label: 'Progress' },
        { href: '/profile/performance', label: 'Performance' },
        { href: '/profile/integrations', label: 'Integrations' },
        { href: '/profile/settings', label: 'Settings' },
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