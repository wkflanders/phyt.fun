import React, { useState, useRef, useEffect } from 'react';
import { usePrivy, useFundWallet } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Wallet,
    CreditCard,
    ArrowDownLeft,
    ArrowLeft,
    Copy,
    Check,
    Loader2,
    History,
    ArrowDown,
    ArrowUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserTransactions } from '@/hooks/use-get-user-transactions';
import { useGetUser } from '@/hooks/use-get-user';

interface WalletPopoverProps {
    onClose?: () => void;
}

export const WalletPopover: React.FC<WalletPopoverProps> = ({ onClose }) => {
    const { ready } = usePrivy();
    const { address, isConnecting } = useAccount();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [view, setView] = useState<'main' | 'deposit' | 'history'>('main');
    const [isProcessing, setIsProcessing] = useState(false);
    const { data: user, isLoading: isGetUserLoading } = useGetUser();
    const { data: transactions, isLoading: isTransactionLoading } = useGetUserTransactions();
    const { fundWallet } = useFundWallet();
    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: address as `0x${string}`,
    });

    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose && onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const formatAddress = (addr: string | undefined) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            toast({
                title: 'Address Copied',
                description: 'Wallet address copied to clipboard',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to copy address',
                variant: 'destructive',
            });
        }
    };

    const handleFundWallet = async (addr: string | undefined) => {
        if (!addr || isProcessing) return;
        setIsProcessing(true);
        try {
            await fundWallet(addr);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fund wallet',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!ready || isConnecting || isGetUserLoading) {
        return (
            <div ref={popoverRef} className="absolute top-16 right-16 z-50">
                <Card className="w-96 h-[400px] bg-card/30 border border-white/10 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-text-dim" />
                </Card>
            </div>
        );
    }

    let content;
    if (view === 'deposit') {
        content = (
            <>
                <CardHeader >
                    <div className="flex items-center gap-2 ">
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setView('main');
                            }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <CardTitle className="text-text">Deposit Funds</CardTitle>
                    </div>
                </CardHeader>
                <CardContent >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-md text-text">Your Wallet Address</p>
                            <div className="flex items-center gap-2 p-3 bg-phyt_form bg-opacity-10 rounded-lg">
                                <code className="flex-1 font-mono text-md text-text break-all">{formatAddress(address)}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="shrink-0 text-text-dim hover:text-text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyAddress();
                                    }}
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </Button>
                            </div>
                            <p className="text-xs text-text-dim">
                                Send only ETH or Base compatible tokens to this address.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </>
        );
    } else if (view === 'history') {
        content = (
            <>
                <CardHeader >
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                setView('main');
                            }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <CardTitle className="text-text">Transaction History</CardTitle>
                    </div>
                </CardHeader>
                <CardContent >
                    <div className="space-y-4">
                        {isTransactionLoading ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-phyt_blue" />
                            </div>
                        ) : transactions?.length === 0 ? (
                            <p className="text-text-dim text-center">No transactions found</p>
                        ) : (
                            transactions?.map((tx, index) => (
                                <div key={index} className="border-b border-phyt_text last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {tx.from_user_id === user?.id ? (
                                                <ArrowUp className="text-red-500" size={16} />
                                            ) : (
                                                <ArrowDown className="text-green-500" size={16} />
                                            )}
                                            <div>
                                                <p className="text-md text-text">
                                                    {tx.from_user_id === user?.id ? 'Sent' : 'Received'}
                                                </p>
                                                <p className="text-xs text-text-dim">
                                                    {formatTimestamp(tx.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-text">{tx.token_amount} Tokens</p>
                                            <p className="text-xs text-text-dim">{tx.transaction_type}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </>
        );
    } else {
        // Main view
        content = (
            <>
                <CardHeader >
                    <CardTitle className="text-text flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        <span className="text-lg">Your Wallet</span>
                    </CardTitle>
                </CardHeader>
                <CardContent >
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg">
                            <p className="text-text text-lg mb-1">Wallet Address</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-text">{formatAddress(address)}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyAddress();
                                    }}
                                    className="text-text-dim hover:text-text"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg">
                            <p className="text-text text-lg mb-1">Balance</p>
                            {isBalanceLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-phyt_blue" />
                            ) : (
                                <p className="text-lg text-text">
                                    ≈ {balanceData ? Number(formatEther(balanceData.value)).toFixed(3) : '0.000'} ETH
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant="default"
                                className="flex flex-col bg-transparent rounded-xl hover:bg-card items-center gap-2 h-auto py-4 text-text hover:text-text border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setView('deposit');
                                }}
                            >
                                <ArrowDownLeft size={20} className="text-text" />
                                <span className="text-xs">Deposit</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col bg-transparent rounded-xl hover:bg-card items-center gap-2 h-auto py-4 border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFundWallet(address);
                                }}
                            >
                                <CreditCard size={20} className="text-text" />
                                <span className="text-xs">Buy</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col bg-transparent rounded-xl hover:bg-card items-center gap-2 h-auto py-4 border border-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setView('history');
                                }}
                            >
                                <History size={20} className="text-text" />
                                <span className="text-xs">History</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </>
        );
    }

    return (
        <div onClick={onClose} className="fixed inset-0 z-40">
            {/* The popover container stops the click event from propagating to the overlay */}
            <div
                ref={popoverRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-16 right-16 z-50"
            >
                <Card className="w-96 bg-card/30 border border-white/10 shadow-lg backdrop-blur-lg cursor-default">
                    {content}
                </Card>
            </div>
        </div>
    );
};
