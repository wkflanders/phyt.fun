'use client';

import { env } from '@/env';
import { privyConfig } from '@/lib/privyConfig';
import { config } from '@/lib/wagmi';

import React from 'react';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={env.NEXT_PUBLIC_PRIVY_APP_ID}
            config={privyConfig}
        >
            <AuthProvider>
                <QueryProvider>
                    <WagmiProvider config={config}>{children}</WagmiProvider>
                </QueryProvider>
            </AuthProvider>
        </PrivyProvider>
    );
}
