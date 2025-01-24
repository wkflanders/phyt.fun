'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryProvider } from './QueryProvider';
import { WagmiProvider } from "@privy-io/wagmi";
import { config } from "@/lib/wagmi";
import { privyConfig } from '@/lib/privyConfig';

export default function Providers({ children }: { children: React.ReactNode; }) {
    return (

        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={privyConfig}
        >
            <QueryProvider>
                <WagmiProvider config={config}>
                    {children}
                </WagmiProvider>
            </QueryProvider>
        </PrivyProvider>

    );
}
