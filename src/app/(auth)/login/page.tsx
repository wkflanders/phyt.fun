"use client";

import React from 'react';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function Login() {
    const router = useRouter();
    const { getAccessToken } = usePrivy();
    const { login } = useLogin({
        onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, }) => {
            try {

            } catch (error) {
                console.error('Login error: ', error);
            }
        }
    });

    return (
        <div>
            <Button onClick={login} className="text-xl font-inconsolata font-bold w-full h-14 bg-red hover:bg-red-100 hover:text-phyt_text_dark">
                LOGIN
            </Button>
        </div>
    );
}
