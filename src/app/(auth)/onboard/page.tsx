'use client';

import React from 'react';
import { OnboardForm } from '@/components/OnboardForm';
import { onboardFormSchema } from '@/lib/validation';

const DEFAULT_AVATAR_URL = 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export default function Onboard() {
    return (
        <OnboardForm
            schema={onboardFormSchema}
            defaultValues={{
                username: '',
                avatar_url: DEFAULT_AVATAR_URL,
            }}
            onSubmit={() => { }}
        />
    );
};