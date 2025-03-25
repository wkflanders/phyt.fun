'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { OnboardForm } from '@/components/OnboardForm';
import { onboardFormSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser, useGetUser } from '@/hooks/use-users';
import { ApiError } from '@phyt/types';

export default function OnboardPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, ready } = usePrivy();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: userData } = useGetUser();
    const createUser = useCreateUser();

    useEffect(() => {
        if (userData) {
            router.push('/');
            return;
        }
    }, [userData]);

    const handleSubmit = async (formData: FormData) => {
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

            // Add additional user data to FormData
            formData.append('email', user.google.email);
            formData.append('privy_id', user.id);
            if (user.wallet?.address) {
                formData.append('wallet_address', user.wallet.address);
            }

            await createUser.mutateAsync({ formData });

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
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting || createUser.isPending}
            />
        )
    );
}