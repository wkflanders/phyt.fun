import React from 'react';
import {
    Home,
    Package,
    ShoppingCart,
    Trophy,
    BarChart2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Package, label: 'Packs', href: '/pack' },
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
            className="fixed left-0 top-0 z-50 h-screen w-56 sidebar-glass"
        >
            <div className="flex items-center px-4 py-2">
                <div className="flex items-center">
                    <span className="font-semibold text-white">
                        <Image
                            src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v"
                            alt="PHYT"
                            width={300}
                            height={300}
                        />
                    </span>
                    <span className="ml-2 rounded-sm bg-gray-700 px-1 py-0.5 text-xs">BETA</span>
                </div>
            </div>

            <div className="mt-8 px-3">
                {menuItems.map((item, index) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            href={item.href}
                            key={index}
                        >
                            <div
                                className={`mb-4 flex cursor-pointer items-center rounded-md p-2 hover:bg-gray-800 
                                ${active ? 'text-white' : 'text-gray-300'}`}
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className="ml-4 font-medium">
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