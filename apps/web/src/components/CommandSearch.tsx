import React, { useState } from "react";
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetRunners } from "@/hooks/use-runners";

export function CommandSearch() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const { data: runners = [], isLoading } = useGetRunners();

    const filteredRunners = runners.filter((runner) =>
        runner.username.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenSearch = () => {
        setOpen(true);
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
    };

    const handleCloseSearch = () => {
        setOpen(false);
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "Escape") handleCloseSearch();
    };

    if (typeof window !== "undefined") {
        window.onkeydown = (e) => {
            if (e.key === "/" && !open) {
                e.preventDefault();
                handleOpenSearch();
            }
        };
    }

    return (
        <>
            <button
                onClick={handleOpenSearch}
                className="w-1/3 flex cursor-text items-center gap-2 rounded-xl bg-zinc-900/40 border border-white/10 px-5 py-2.5 text-md hover:bg-black/15 transition-colors backdrop-blur-md"
                aria-label="Search runners"
            >
                <Search className="w-4 h-4 text-text" />
                <span className="text-text">Search runners</span>
                <span className="ml-auto text-xs text-text border border-white/10 px-2 py-0.5 rounded">/</span>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-[9999] bg-black/20 cursor-default"
                        onClick={handleCloseSearch}
                        role="button"
                        tabIndex={-1}
                        aria-label="Close search"
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh'
                        }}
                    />

                    <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-[10vh] pointer-events-none">
                        <div className="w-full max-w-3xl overflow-hidden shadow-2xl pointer-events-auto rounded-xl">
                            <div className="relative">
                                <Command className="pt-3 overflow-visible bg-background">
                                    <div className="flex items-center px-3">
                                        <CommandInput
                                            placeholder="Search runners..."
                                            value={search}
                                            onValueChange={setSearch}
                                            className="flex-1 py-4 text-xl bg-transparent border-none focus:outline-none focus:ring-0"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="p-3 bg-transparent">
                                        {search.length > 0 ? (
                                            <CommandList className="max-h-[60vh] py-2 overflow-y-auto">
                                                <CommandEmpty className="py-6 text-center text-text-dim">
                                                    No runners found.
                                                </CommandEmpty>
                                                <CommandGroup heading="Runners">
                                                    {isLoading ? (
                                                        <div className="flex justify-center py-6">
                                                            <div className="w-5 h-5 border-2 rounded-full border-r-transparent border-white/10 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        filteredRunners.map((runner) => (
                                                            <CommandItem
                                                                key={runner.id}
                                                                onSelect={() => {
                                                                    router.push(`/runner/${runner.id}`);
                                                                    handleCloseSearch();
                                                                }}
                                                                className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-black/30"
                                                            >
                                                                <Image
                                                                    src={runner.avatar_url}
                                                                    alt={runner.username}
                                                                    width={38}
                                                                    height={38}
                                                                    className="rounded-full"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-text">{runner.username}</p>
                                                                    <p className="text-md text-text-dim">{String(runner.id).slice(0, 8)}...</p>
                                                                </div>
                                                            </CommandItem>
                                                        ))
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        ) : (
                                            <div className="py-8">
                                                <h3 className="px-4 mb-3 font-medium text-text-dim text-md">TRENDING RUNNERS</h3>
                                                <CommandList className="max-h-[60vh] overflow-y-auto">
                                                    {isLoading ? (
                                                        <div className="flex justify-center py-6">
                                                            <div className="w-5 h-5 border-2 rounded-full border-r-transparent border-white/10 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        runners.slice(0, 5).map((runner) => (
                                                            <CommandItem
                                                                key={runner.id}
                                                                onSelect={() => {
                                                                    router.push(`/runner/${runner.id}`);
                                                                    handleCloseSearch();
                                                                }}
                                                                className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer hover:bg-black/30"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <Image
                                                                        src={runner.avatar_url}
                                                                        alt={runner.username}
                                                                        width={38}
                                                                        height={38}
                                                                        className="rounded-full"
                                                                    />
                                                                    <div>
                                                                        <p className="font-medium text-text">{runner.username}</p>
                                                                        <p className="text-md text-text-dim">{Math.floor(Math.random() * 10000)} runs</p>
                                                                    </div>
                                                                </div>
                                                                <div className="font-medium text-md text-text-dim">
                                                                    {(Math.random() * 0.01).toFixed(4)} ETH
                                                                </div>
                                                            </CommandItem>
                                                        ))
                                                    )}
                                                </CommandList>
                                            </div>
                                        )}
                                    </div>
                                </Command>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}