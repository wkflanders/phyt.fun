'use client';

import { isErrorWithStatusCode } from '@phyt/infra';

import { OnboardForm } from '@/components/OnboardForm';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser, useGetUser } from '@/hooks/use-users';
import { onboardFormSchema } from '@/lib/validation';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { usePrivy } from '@privy-io/react-auth';

export const Onboard = () => {
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
            const typedFormData = formData;

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
        } catch (error: unknown) {
            if (isErrorWithStatusCode(error)) {
                console.error(error.message);

                if (error.statusCode === 422) {
                    toast({
                        title: 'Error',
                        description:
                            'Username already exists. Please choose another one.',
                        variant: 'destructive'
                    });
                } else {
                    toast({
                        title: 'Error',
                        description: error.message,
                        variant: 'destructive'
                    });
                }
            } else {
                // Fallback for errors that don't have statusCode
                console.error(error);
                toast({
                    title: 'Error',
                    description: 'An unexpected error occurred.',
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
};
