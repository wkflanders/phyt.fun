import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    title: string;
    description: string;
    buttonText?: string;
    onButtonClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    buttonText,
    onButtonClick
}) => {
    return (
        <div className="text-center py-12">
            <div className="mb-4">
                <Image
                    src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut"
                    alt="Empty state"
                    width={120}
                    height={120}
                    className="mx-auto rounded-full"
                />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>
            <p className="text-text-dim mb-6">{description}</p>
            {buttonText && (
                <Button
                    variant="default"
                    className="bg-primary text-black hover:bg-primary/90"
                    onClick={onButtonClick}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
};