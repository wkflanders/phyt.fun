"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { usePrivy } from '@privy-io/react-auth';

import { cn } from '@/lib/utils';

export function Header() {
    const pathname = usePathname();
    const { user, ready } = usePrivy();

    return (
        ready && (
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
                    <li>
                        user.id
                    </li>
                </ul>
            </header>
        )
    );
}
