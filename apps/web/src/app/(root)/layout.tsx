import React from 'react';
import { Aside } from '@/components/Aside/Aside';

export default function Layout({ children }: { children: React.ReactNode; }) {
    return (
        <main className="h-screen w-full bg-phyt_gray">
            <div className="flex h-full w-full">
                <Aside />
                {children}
            </div>
        </main>
    );
}