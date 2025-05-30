'use client';

import { Onboard } from '@/components/auth/Onboard';

import React, { Suspense } from 'react';

export default function OnboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Onboard />
        </Suspense>
    );
}
