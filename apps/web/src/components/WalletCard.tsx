'use client';

import React, { useState } from 'react';
import { usePrivy, useFundWallet } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { Wallet, CreditCard, ArrowDownLeft, Copy, Check, Loader2, History, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserTransactions } from '@/hooks/use-get-user-transactions';
import { useGetUser } from '@/hooks/use-get-user';

export const WalletCard = () => {
    const { user: privyUser, ready } = usePrivy();
    const { address, isConnecting } = useAccount();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [activeModal, setActiveModal] = useState<'deposit' | 'buy' | 'history' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { data: user, isLoading: isGetUserLoading } = useGetUser();
    const { data: transactions, isLoading: isTransactionLoading } = useGetUserTransactions();
    const { fundWallet } = useFundWallet();

    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: address as `0x${string}`,
    });

    const formatAddress = (address: string | undefined) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            toast({
                title: "Address Copied",
                description: "Wallet address copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy address",
                variant: "destructive",
            });
        }
    };

    const handleFundWallet = async (address: string | undefined) => {
        if (!address || isProcessing) return;

        setIsProcessing(true);
        try {
            await fundWallet(address);
        } catch (error: any) {
            console.error("Error funding wallet:", error); // Log the full error object
            toast({
                title: "Error",
                description: error.message || "Failed to fund wallet",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => setActiveModal(null);

    if (!ready || isConnecting || isGetUserLoading) {
        return (
            <Card className="w-96 h-[400px] bg-black border-2 border-phyt_form flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
            </Card>
        );
    }

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-phyt_text">
                                    {formatAddress(address)}
                                </p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={copyAddress}
                                    className="text-phyt_text_secondary hover:text-phyt_text"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-phyt_form bg-opacity-10 p-4 rounded-lg">
                            <p className="text-phyt_text_secondary text-sm mb-1">Balance</p>
                            {isBalanceLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-phyt_blue" />
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-phyt_text">
                                        {balanceData ? formatEther(balanceData.value) : '0.00'} ETH
                                    </p>
                                </>
                            )}
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
                                onClick={() => handleFundWallet(address)}
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
                                {address}
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

            <Modal
                isOpen={activeModal === 'history'}
                onClose={closeModal}
                title="Transaction History"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="bg-phyt_form bg-opacity-10 rounded-lg p-4">
                            <div className="flex flex-col gap-4">
                                {isTransactionLoading ? ( // Show loading spinner while transactions are being fetched
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
                                    </div>
                                ) : transactions?.length === 0 ? ( // Show message if no transactions are found
                                    <p className="text-phyt_text_secondary text-center">
                                        No transactions found
                                    </p>
                                ) : (
                                    transactions?.map((tx, index) => ( // Map through transactions and display them
                                        <div key={index} className="border-b border-phyt_form last:border-0 pb-3 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {tx.from_user_id === user?.id ? ( // Check if the user is the sender
                                                        <ArrowUp className="text-red" size={16} /> // Sent transaction icon
                                                    ) : (
                                                        <ArrowDown className="text-green-500" size={16} /> // Received transaction icon
                                                    )}
                                                    <div>
                                                        <p className="text-sm text-phyt_text">
                                                            {tx.from_user_id === user?.id ? 'Sent' : 'Received'}
                                                        </p>
                                                        <p className="text-xs text-phyt_text_secondary">
                                                            {formatTimestamp(tx.created_at)} {/* Format the timestamp */}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-phyt_text">
                                                        {tx.token_amount} Tokens {/* Display the token amount */}
                                                    </p>
                                                    <p className="text-xs text-phyt_text_secondary">
                                                        {tx.transaction_type} {/* Display the transaction type */}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};