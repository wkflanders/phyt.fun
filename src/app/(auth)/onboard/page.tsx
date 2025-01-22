'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { OnboardForm } from '@/components/OnboardForm';
import { onboardFormSchema, OnboardFormData } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/utils';

const DEFAULT_AVATAR_URL = 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export default function Onboard() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, ready } = usePrivy();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: OnboardFormData) => {
        if (!user?.google) {
            toast({
                title: "Error",
                description: "User email not found",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.google,
                    username: data.username,
                    avatar_url: data.avatar_url || DEFAULT_AVATAR_URL,
                    privy_id: user.id,
                    wallet_address: user.wallet?.address,
                }),
            });

            if (!response.ok) {
                const { error, status } = await handleApiError(response);
                if (status === 409) {
                    toast({
                        title: "Error",
                        description: "Username already exists. Please choose another one.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: error,
                        variant: "destructive",
                    });
                }
                return;
            }

            toast({
                title: "Success",
                description: "Profile created successfully!",
            });

            router.push('/');
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: "Failed to create profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <OnboardForm
            schema={onboardFormSchema}
            defaultValues={{
                username: '',
                avatar_url: DEFAULT_AVATAR_URL,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    );
};