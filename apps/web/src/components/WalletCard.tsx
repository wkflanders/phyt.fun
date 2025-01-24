'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/Modal';
import { Wallet, History, CreditCard, ArrowDownLeft, Copy, Check } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

export const WalletCard = () => {
    const { user, ready } = usePrivy();
    const [copied, setCopied] = useState(false);
    const [activeModal, setActiveModal] = useState<'deposit' | 'buy' | 'history' | null>(null);
    const walletAddress = user?.wallet?.address || '';

    const formatAddress = (address: string | undefined) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const closeModal = () => setActiveModal(null);

    return (
        <div className="w-96 space-y-4 p-4">
            <Card className="bg-black border-2 border-phyt_form">
                <CardHeader>
                    <CardTitle className="text-phyt_text flex items-center gap-2">
                        <Wallet className="text-phyt_blue" size={24} />
                        Your Wallet
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="bg-phyt_form bg-opacity-10 p-4 rounded-lg">
                            <p className="text-phyt_text_secondary text-sm mb-1">Wallet Address</p>
                            <p className="font-mono text-phyt_text">
                                {formatAddress(walletAddress)}
                            </p>
                        </div>

                        <div className="bg-phyt_form bg-opacity-10 p-4 rounded-lg">
                            <p className="text-phyt_text_secondary text-sm mb-1">Balance</p>
                            <p className="text-2xl font-bold text-phyt_text">0.00 ETH</p>
                            <p className="text-phyt_text_secondary text-sm">≈ $0.00 USD</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 border-phyt_form_border hover:bg-phyt_form text-phyt_text hover:text-phyt_text"
                                onClick={() => setActiveModal('deposit')}
                            >
                                <ArrowDownLeft size={20} className="text-phyt_blue" />
                                <span className="text-xs">Deposit</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 border-phyt_form_border hover:bg-phyt_form text-phyt_text hover:text-phyt_text"
                                onClick={() => setActiveModal('buy')}
                            >
                                <CreditCard size={20} className="text-phyt_blue" />
                                <span className="text-xs">Buy</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 border-phyt_form_border hover:bg-phyt_form text-phyt_text hover:text-phyt_text"
                                onClick={() => setActiveModal('history')}
                            >
                                <History size={20} className="text-phyt_blue" />
                                <span className="text-xs">History</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* deposit Modal */}
            <Modal
                isOpen={activeModal === 'deposit'}
                onClose={closeModal}
                title="Deposit Funds"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-phyt_text_secondary">Your Wallet Address</p>
                        <div className="flex items-center gap-2 p-3 bg-phyt_form bg-opacity-10 rounded-lg">
                            <code className="flex-1 font-mono text-sm text-phyt_text break-all">
                                {walletAddress}
                            </code>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="shrink-0 text-phyt_text_secondary hover:text-phyt_text"
                                onClick={copyAddress}
                            >
                                {copied ? (
                                    <Check size={16} className="text-green-500" />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-phyt_text_secondary">
                            Send only ETH or Base compatible tokens to this address
                        </p>
                    </div>
                </div>
            </Modal>

            {/* Buy Modal */}
            <Modal
                isOpen={activeModal === 'buy'}
                onClose={closeModal}
                title="Buy Crypto"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-phyt_text_secondary">Amount (USD)</p>
                        <Input
                            type="number"
                            placeholder="Enter amount in USD"
                            className="bg-phyt_form border-phyt_form_border text-phyt_text"
                        />
                        <p className="text-xs text-phyt_text_secondary text-right">
                            ≈ 0.00 ETH
                        </p>
                    </div>
                    <Button className="w-full bg-phyt_blue hover:bg-phyt_blue/80 text-black font-bold">
                        Continue to Payment
                    </Button>
                </div>
            </Modal>

            {/* History Modal */}
            <Modal
                isOpen={activeModal === 'history'}
                onClose={closeModal}
                title="Transaction History"
            >
                <div className="space-y-2">
                    <p className="text-phyt_text_secondary text-center py-8">
                        No transactions found
                    </p>
                </div>
            </Modal>
        </div>
    );
};