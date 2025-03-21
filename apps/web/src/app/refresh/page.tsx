'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@privy-io/react-auth';

export default function RefreshPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        async function refresh() {
            const token = await getAccessToken();
            const redirectUri = searchParams.get("redirect_uri") || "/";
            if (token) {
                router.push(redirectUri);
            } else {
                router.push("/login");
            }
        }
        refresh();
    }, [router, searchParams]);

    return <div>Refreshing session...</div>;
}