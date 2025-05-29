'use client';

import { Login } from '@/components/auth/Login';

import React, { Suspense } from 'react';

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Login />
        </Suspense>
    );
}
