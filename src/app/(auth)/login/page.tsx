"use client";

import React, { useState } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';

import { handleApiError } from '@/lib/utils';

import { Button } from '@/components/ui/button';

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready, getAccessToken, authenticated } = usePrivy();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const disableLogin = !ready || (ready && authenticated);

    const { login } = useLogin({
        onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, }) => {
            try {
                const accessToken = await getAccessToken();

                if (wasAlreadyAuthenticated) {
                    const redirectTo = searchParams.get('redirect') || '/';
                    router.push(redirectTo);
                    return;
                }
                if (isNewUser) {
                    const response = await fetch('/api/users/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                            userId: user.id,
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create user');
                    }
                } else {
                    const response = await fetch(`/api/users/${user.id}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }

                    const userData = await response.json();
                }

                const redirectTo = searchParams.get('redirect') || '/';
                router.push(redirectTo);
            } catch (error) {
                console.error('Login error: ', error);
                setError('Failed to login. Please try again');
            }
        }
    });

    return (
        <div>
            <Button disabled={disableLogin} onClick={login} className="text-xl font-inconsolata font-bold w-full h-14 bg-red hover:bg-red-100 hover:text-phyt_text_dark">
                LOGIN
            </Button>
        </div>
    );
}
