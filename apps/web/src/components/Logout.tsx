'use client';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from './ui/button';

const Logout = () => {
    const { ready, logout } = usePrivy();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };
    return ready && <Button onClick={handleLogout}>logout</Button>;
};

export default Logout;
