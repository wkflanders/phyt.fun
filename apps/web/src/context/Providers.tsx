'use client';

import React from 'react';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';

import { env } from '@/env';
import { privyConfig } from '@/lib/privyConfig';
import { config } from '@/lib/wagmi';

import { QueryProvider } from './QueryProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
            config={privyConfig}
        >
            <QueryProvider>
                <WagmiProvider config={config}>{children}</WagmiProvider>
            </QueryProvider>
        </PrivyProvider>
    );
}
