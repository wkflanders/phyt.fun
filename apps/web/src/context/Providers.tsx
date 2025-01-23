'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryProvider } from './QueryProvider';

export default function Providers({ children }: { children: React.ReactNode; }) {
    return (

        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: 'dark',
                    accentColor: '#00F6FB',
                    logo: 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkF3xIgVJvDkJmxutZaE5dj0qbGXU9Kl6ASci7P',
                },
                // Create embedded wallets for users who don't have a wallet
                embeddedWallets: {
                    createOnLogin: 'users-without-wallets',
                },
            }}
        >
            <QueryProvider>
                {children}
            </QueryProvider>
        </PrivyProvider>

    );
}
