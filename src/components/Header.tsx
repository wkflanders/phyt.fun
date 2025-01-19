"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="my-10 flex justify-between gap-5 text-white">
            <Link href="/">
                Phyt
            </Link>
            <ul className="flex flex-row items-center gapy-8">
                <li>
                    <Link href="/packs" className={cn("text-base cursor-pointer capitalize", pathname === '/packs' ? 'text-phyt_red' : 'text-phyt_blue')}>
                        Packs
                    </Link>

                </li>
            </ul>
        </header>
    );
}
