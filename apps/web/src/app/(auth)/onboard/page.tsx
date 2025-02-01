'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { OnboardForm } from '@/components/OnboardForm';
import { onboardFormSchema, OnboardFormData } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/use-create-user';

import { ApiError } from '@phyt/types';

const DEFAULT_AVATAR_URL = 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export default function OnboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, ready } = usePrivy();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createUser = useCreateUser();

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

            const userData = {
                email: user.google.email,
                username: data.username,
                avatar_url: data.avatar_url || DEFAULT_AVATAR_URL,
                privy_id: user.id,
                wallet_address: user.wallet?.address,
            };

            await createUser.mutateAsync(userData);

            router.push('/');

            toast({
                title: "Success",
                description: "Profile created successfully!",
            });
        } catch (error) {
            const apiError = error as ApiError;

            if (apiError.status === 409) {
                toast({
                    title: "Error",
                    description: "Username already exists. Please choose another one.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: apiError.error || "Failed to create profile. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        ready && (
            <OnboardForm
                schema={onboardFormSchema}
                defaultValues={{
                    username: '',
                    avatar_url: DEFAULT_AVATAR_URL,
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        )
    );
};