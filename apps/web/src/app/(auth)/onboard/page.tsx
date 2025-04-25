'use client';

import { onboardFormSchema } from '@/lib/validation';
import { ApiError, CreateUserFormData } from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { OnboardForm } from '@/components/OnboardForm';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser, useGetUser } from '@/hooks/use-users';

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
    }, [userData, router]);

    const handleSubmit = async (formData: FormData) => {
        if (!user?.google) {
            toast({
                title: 'Error',
                description: 'User email not found',
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Create a properly typed FormData object
            const typedFormData = formData as CreateUserFormData;

            // Add additional user data to FormData
            typedFormData.append('email', user.google.email);
            typedFormData.append('privyId', user.id);
            if (user.wallet?.address) {
                typedFormData.append('walletAddress', user.wallet.address);
            }

            await createUser.mutateAsync({ formData: typedFormData });

            router.push('/');

            toast({
                title: 'Success',
                description: 'Profile created successfully!'
            });
        } catch (error) {
            const apiError = error as ApiError;
            console.error(apiError.message);

            if (apiError.statusCode === 422) {
                toast({
                    title: 'Error',
                    description:
                        'Username already exists. Please choose another one.',
                    variant: 'destructive'
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to create profile. Please try again.',
                    variant: 'destructive'
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
                    username: ''
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting || createUser.isPending}
            />
        )
    );
}
