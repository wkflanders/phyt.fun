import React, { useState } from 'react';
import {
    Home,
    PackageSearch,
    ShoppingCart,
    Trophy,
    BarChart2,
    Gift
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);

    const menuItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: PackageSearch, label: 'Packs', href: '/pack' },
        { icon: ShoppingCart, label: 'Marketplace', href: '/marketplace' },
        { icon: Trophy, label: 'Competition', href: '/competition' },
        { icon: BarChart2, label: 'Leaderboard', href: '/leaderboard' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out sidebar-glass",
                isExpanded ? "w-56" : "w-16"
            )}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex items-center px-4 py-2 mt-1">
                <div className="flex items-center">
                    <span className="font-semibold text-text">
                        <div
                            className={cn(
                                "relative h-14 w-36 transition-all duration-300 overflow-hidden",
                                "clip-sidebar"
                            )}
                            style={{
                                clipPath: isExpanded
                                    ? 'inset(0 0 0 0)' // Fully visible when expanded
                                    : 'inset(0 calc(100% - 2rem) 0 0)', // Clipped to 4rem (w-16) when collapsed
                            }}
                        >
                            <Image
                                src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v"
                                alt="PHYT"
                                width={150}
                                height={40}
                                className="object-cover"
                            />
                        </div>
                    </span>
                    <span
                        className={cn(
                            "ml-2 rounded-sm bg-secondary-shade px-1 py-0.5 text-xs transition-all duration-200",
                            isExpanded ? "opacity-100" : "opacity-0"
                        )}
                    >
                        BETA
                    </span>
                </div>
            </div>

            <div className="px-3 mt-8">
                {menuItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            href={item.href}
                            key={index}
                            className="block"
                        >
                            <div
                                className={cn(
                                    "mb-4 flex cursor-pointer items-center rounded-md p-2 hover:bg-black/20 transition-all duration-300",
                                    active ? 'text-text' : 'text-text-dim'
                                )}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span
                                    className={cn(
                                        "ml-4 font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                                        isExpanded
                                            ? "max-w-full opacity-100"
                                            : "max-w-0 opacity-0"
                                    )}
                                >
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};