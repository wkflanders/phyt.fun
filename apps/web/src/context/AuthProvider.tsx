'use client';

import { setTokenGetter } from '@/lib/api';

import React from 'react';

import { usePrivy } from '@privy-io/react-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { getAccessToken } = usePrivy();

    // Set the token getter function for the API interceptors
    setTokenGetter(async () => {
        try {
            return await getAccessToken();
        } catch (error) {
            console.error('Failed to get access token:', error);
            return null;
        }
    });

    return <>{children}</>;
}
