'use client';
import React from 'react';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';

const Logout = () => {
    const { ready, logout } = usePrivy();
    return (
        <Button onClick={logout}>
            click me
        </Button>
    );
};

export default Logout;
