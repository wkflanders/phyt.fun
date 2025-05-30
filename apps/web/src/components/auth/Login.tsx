'use client';

import { isAPIError } from '@phyt/infra';

import { Button } from '@/components/ui/button';
import { getUser } from '@/queries/usersQueries';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import { usePrivy, useLogin } from '@privy-io/react-auth';

export const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready } = usePrivy();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useLogin({
        onComplete: async ({ isNewUser, wasAlreadyAuthenticated, user }) => {
            try {
                setIsLoading(true);
                setError(null);

                if (wasAlreadyAuthenticated) {
                    const redirectTo = searchParams.get('redirect') ?? '/';
                    router.push(redirectTo);
                    return;
                }
                if (isNewUser) {
                    router.push('/onboard');
                } else {
                    try {
                        await getUser(user.id);

                        const redirectTo = searchParams.get('redirect') ?? '/';
                        router.push(redirectTo);
                    } catch (error: unknown) {
                        if (isAPIError(error)) {
                            console.error(error.message);
                            if (error.statusCode === 400) {
                                router.push('/onboard');
                            }
                        } else {
                            // Fallback for errors that don't have statusCode
                            console.error(error);
                            setError('Failed to login. Please try again');
                        }
                    }
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
                disabled={isLoading || !ready}
                className="text-xl font-inconsolata font-bold w-full h-14 bg-secondary hover:bg-secondary-shade"
            >
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>

            {error && (
                <div className="text-red text-sm text-center">{error}</div>
            )}
        </div>
    );
};
