import React, { useState } from 'react';
import { usePrivy, useFundWallet } from '@privy-io/react-auth';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetUserTransactions } from '@/hooks/use-users';
import { useGetUser } from '@/hooks/use-users';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export const WalletPopover: React.FC = () => {
    const { ready, exportWallet } = usePrivy();
    const { address, isConnecting } = useAccount();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [view, setView] = useState<'main' | 'deposit' | 'history' | 'export'>('main');
    const [isProcessing, setIsProcessing] = useState(false);
    const { data: user, isLoading: isGetUserLoading } = useGetUser();
    const { data: transactions, isLoading: isTransactionLoading } = useGetUserTransactions();
    const { fundWallet } = useFundWallet();
    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: address as `0x${string}`,
    });

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

    const formatTimestamp = (timestamp: string | Date) => {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    let content;
    if (!ready || isConnecting || isGetUserLoading) {
        content = (
            <>
                <Loader2 className="w-8 h-8 animate-spin text-text-dim" />
            </>
        );
    }

    if (view === 'deposit') {
        content = (
            <>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setView('main'); }}>
                            <ArrowLeft size={20} />
                        </Button>
                        <CardTitle className="text-text">Deposit Funds</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-md text-text">Your Wallet Address</p>
                            <div className="flex items-center gap-2 p-3 rounded-lg">
                                <code className="flex-1 font-mono break-all text-md text-text">{formatAddress(address)}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="shrink-0 text-text-dim hover:text-text"
                                    onClick={(e) => { e.stopPropagation(); copyAddress(); }}
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </Button>
                            </div>
                            <p className="text-xs text-text-dim">
                                ONLY SEND ETH ON BASE TO THIS ADDRESS.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </>
        );
    } else if (view === 'history') {
        content = (
            <>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setView('main'); }}>
                            <ArrowLeft size={20} />
                        </Button>
                        <CardTitle className="text-text">Transaction History</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isTransactionLoading ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-phyt_blue" />
                            </div>
                        ) : transactions?.length === 0 ? (
                            <p className="text-center text-text-dim">No transactions found</p>
                        ) : (
                            transactions?.map((tx, index) => (
                                <div key={index} className="pb-3 border-b border-phyt_text last:border-0 last:pb-0">
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
                                            <p className="text-sm text-text">{tx.price} Tokens</p>
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
        content = (
            <>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-text">
                        <Wallet className="w-5 h-5" />
                        <span className="text-lg">Your Wallet</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg">
                            <p className="mb-1 text-lg text-text">Wallet Address</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-text">{formatAddress(address)}</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); copyAddress(); }}
                                    className="text-text-dim hover:text-text"
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg">
                            <p className="mb-1 text-lg text-text">Balance</p>
                            {isBalanceLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-text" />
                            ) : (
                                <p className="text-lg font-mono text-text">
                                    ≈ {balanceData ? Number(formatEther(balanceData.value)).toFixed(3) : '0.000'} ETH
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <Button
                                variant="default"
                                className="flex flex-col items-center h-auto gap-2 py-4 bg-transparent border rounded-xl hover:bg-zinc-900 text-text hover:text-text border-white/10"
                                onClick={(e) => { e.stopPropagation(); setView('deposit'); }}
                            >
                                <ArrowDownLeft size={20} className="text-text" />
                                <span className="text-xs">Deposit</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col items-center h-auto gap-2 py-4 bg-transparent border rounded-xl hover:bg-zinc-900 border-white/10"
                                onClick={(e) => { e.stopPropagation(); handleFundWallet(address); }}
                            >
                                <CreditCard size={20} className="text-text" />
                                <span className="text-xs">Buy</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col items-center h-auto gap-2 py-4 bg-transparent border rounded-xl hover:bg-zinc-900 border-white/10"
                                onClick={(e) => { e.stopPropagation(); setView('history'); }}
                            >
                                <History size={20} className="text-text" />
                                <span className="text-xs">History</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex flex-col items-center h-auto gap-2 py-4 bg-transparent border rounded-xl hover:bg-zinc-900 border-white/10"
                                onClick={(e) => { e.stopPropagation(); exportWallet({ address: address as `0x${string}` }); }}
                            >
                                <Download size={20} className="text-text" />
                                <span className="text-xs">Export</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="rounded-xl hover:bg-black/20 data-[state=open]:bg-black/20">
                    <div className="hidden lg:block">
                        <p className="font-medium text-md">
                            {isBalanceLoading
                                ? 'Loading...'
                                : balanceData
                                    ? `${Number(formatEther(balanceData.value)).toFixed(4)} ETH`
                                    : '0.0000 ETH'}
                        </p>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-[25vw] bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-lg mt-2.5">
                {content}
            </PopoverContent>
        </Popover>
    );
};
