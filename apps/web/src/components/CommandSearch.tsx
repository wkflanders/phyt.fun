import React, { useState } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetRunners } from '@/hooks/use-get-runners';
import { Loader2 } from 'lucide-react';

export const CommandSearch = () => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { data: runners = [], isLoading } = useGetRunners();

    console.log(runners);

    // Filter runners based on search input
    const filteredRunners = runners.filter((runner) =>
        runner.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full max-w-md">
            <Command className="rounded-lg border shadow-md">
                <CommandInput
                    placeholder="Search runners..."
                    value={search}
                    onValueChange={(value) => {
                        setSearch(value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                />
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-md">
                        <CommandList className="max-h-[300px] overflow-y-auto p-1">
                            <CommandEmpty>No runners found.</CommandEmpty>
                            <CommandGroup>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    filteredRunners.map((runner) => (
                                        <CommandItem
                                            key={runner.id}
                                            value={runner.username}
                                            onSelect={() => {
                                                // Navigate to runner's profile or show their stats
                                                router.push(`/runner/${runner.id}`);
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2"
                                        >
                                            <div className="flex flex-1 items-center gap-2">
                                                <Image
                                                    src={runner.avatar_url}
                                                    alt={runner.username}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                                <span>{runner.username}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{runner.total_distance_m / 1000}km</span>
                                                <span>{runner.average_pace}/km</span>
                                                <span>{runner.total_runs} runs</span>
                                            </div>
                                        </CommandItem>
                                    ))
                                )}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}
            </Command>
        </div>
    );
};