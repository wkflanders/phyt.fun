"use client";

import React, { useState } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';


import { Button } from '@/components/ui/button';

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready, getAccessToken, authenticated } = usePrivy();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useLogin({
        onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated }) => {
            try {
                setIsLoading(true);
                setError(null);
                const accessToken = await getAccessToken();

                if (wasAlreadyAuthenticated) {
                    const redirectTo = searchParams.get('redirect') || '/';
                    router.push(redirectTo);
                    return;
                }
                if (isNewUser) {
                    // const response = await fetch('/api/users/create', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         'Authorization': `Bearer ${accessToken}`,
                    //     },
                    //     body: JSON.stringify({
                    //         email: user.google,

                    //     })
                    // });

                    // if (!response.ok) {
                    //     const { error, status } = await handleApiError(response);
                    //     if (status === 409) {
                    //         setError('This user already exists. Please try logging in again.');
                    //     } else {
                    //         setError(error);
                    //     }
                    //     return;
                    // }

                    router.push('/onboard');
                } else {
                    // const response = await fetch(`/api/users/${user.id}`, {
                    //     method: 'GET',
                    //     headers: {
                    //         'Authorization': `Bearer ${accessToken}`,
                    //     }
                    // });

                    // if (!response.ok) {
                    //     const { error } = await handleApiError(response);
                    //     setError(error);
                    // }

                    const redirectTo = searchParams.get('redirect') || '/';
                    router.push(redirectTo);
                }
            } catch (error) {
                console.error('Login error: ', error);
                setError('Failed to login. Please try again');
            } finally {
                setIsLoading(false);
            }
        }
    });

    return (
        <div className="flex flex-col gap-4">
            <Button
                onClick={login}
                disabled={isLoading}
                className="text-xl font-inconsolata font-bold w-full h-14 bg-red hover:bg-red-100 hover:text-phyt_text_dark"
            >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>

            {error && (
                <div className="text-red text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
