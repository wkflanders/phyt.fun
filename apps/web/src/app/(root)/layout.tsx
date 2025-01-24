import React from 'react';
import { Aside } from '@/components/Aside/Aside';

export default function Layout({ children }: { children: React.ReactNode; }) {
    return (
        <main className="h-full w-full bg-phyt_bg">
            <div className="flex h-full w-full overflow-hidden">
                <Aside />
                {children}
            </div>
        </main>
    );
}
