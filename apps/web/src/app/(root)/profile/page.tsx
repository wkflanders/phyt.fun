import React from 'react';
import { Profile } from '@/components/Profile/Profile';

export default function ProfilePage() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="pl-12">
                <Profile />
            </div>
        </div>
    );
};