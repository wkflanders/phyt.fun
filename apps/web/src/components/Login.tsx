"use client";

import React, { useState } from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUser } from "@/queries/user";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@phyt/types';
import { getUserQueryKey } from '@/queries/user';


export const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { ready } = usePrivy();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const queryClient = useQueryClient();

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
                        const userData = await getUser(user.id);
                        console.log('Setting user data in cache:', userData);

                        const queryKey = getUserQueryKey(user.id);

                        await queryClient.setQueryData(queryKey, userData, {
                            updatedAt: Date.now()
                        });

                        const cachedData = queryClient.getQueryData(queryKey);
                        console.log('Verified cached data:', cachedData);

                        const redirectTo = searchParams.get('redirect') || '/';
                        router.push(redirectTo);
                    } catch (error) {
                        const apiError = error as ApiError;
                        toast({
                            title: "Error",
                            description: apiError.error || `${apiError}`,
                            variant: "destructive",
                        });
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
};
