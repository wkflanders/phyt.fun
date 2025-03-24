'use client';

import React, { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@privy-io/react-auth';

export default function RefreshPageWrapper() {
    return (
        <Suspense fallback={<div>Refreshing session...</div>}>
            <RefreshPage />
        </Suspense>
    );
}

function RefreshPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function refresh() {
            const token = await getAccessToken();
            const redirectUri = searchParams.get('redirect_uri') || '/';
            if (token) {
                router.push(redirectUri);
            } else {
                router.push('/login');
            }
        }
        refresh();
    }, [router, searchParams]);

    return <div className="flex justify-center items-center h-screen">Refreshing session...</div>;
}