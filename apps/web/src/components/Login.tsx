"use client";

import { ApiError } from '@phyt/types';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGetUser } from '@/hooks/use-users';
import { getUser } from "@/queries/user";


export const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready, getAccessToken } = usePrivy();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useLogin({
        onComplete: async ({ isNewUser, wasAlreadyAuthenticated, user }) => {
            try {
                setIsLoading(true);
                setError(null);

                if (wasAlreadyAuthenticated) {
                    const redirectTo = searchParams.get('redirect') || '/';
                    router.push(redirectTo);
                    return;
                }
                if (isNewUser) {
                    router.push('/onboard');
                } else {
                    try {
                        const token = await getAccessToken();
                        const data = await getUser(user.id, token); // Cacheing user data

                        const redirectTo = searchParams.get('redirect') || '/';
                        router.push(redirectTo);
                    } catch (error) {
                        const apiError = error as ApiError;
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
                <div className="text-red text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
};
