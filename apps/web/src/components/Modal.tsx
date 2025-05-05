import React, { useEffect } from 'react';

import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-gradient-to-b from-card_blue-200/80 to-card_blue-100/100 rounded-xl p-6"
                onClick={e => { e.stopPropagation(); }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-phyt_text">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-phyt_text_secondary hover:text-phyt_text"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};