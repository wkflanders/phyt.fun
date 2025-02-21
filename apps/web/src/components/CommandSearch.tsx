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
import { useGetRunners } from "@/hooks/use-get-runners";

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
                className="w-1/4 flex cursor-text items-center gap-2 rounded-lg bg-black-700/10 border border-gray-700 px-5 py-2.5 text-sm hover:bg-black/15 transition-colors backdrop-blur-md"
                aria-label="Search runners"
            >
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Search runners</span>
                <span className="ml-auto text-xs text-gray-500 border border-gray-600 px-2 py-0.5 rounded">/</span>
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
                        <div className="w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden pointer-events-auto">
                            <div className="relative">
                                <Command className="overflow-visible bg-slate-900/10 pt-3 backdrop-blur-sm">
                                    <div className="flex items-center px-3">
                                        <CommandInput
                                            placeholder="Search runners..."
                                            value={search}
                                            onValueChange={setSearch}
                                            className="flex-1 py-4 text-xl bg-transparent border-none focus:outline-none focus:ring-0"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="p-3">
                                        {search.length > 0 ? (
                                            <CommandList className="max-h-[60vh] py-2 overflow-y-auto">
                                                <CommandEmpty className="py-6 text-center text-gray-400">
                                                    No runners found.
                                                </CommandEmpty>
                                                <CommandGroup heading="Runners">
                                                    {isLoading ? (
                                                        <div className="flex justify-center py-6">
                                                            <div className="h-5 w-5 rounded-full border-2 border-r-transparent border-white/30 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        filteredRunners.map((runner) => (
                                                            <CommandItem
                                                                key={runner.id}
                                                                onSelect={() => {
                                                                    router.push(`/runner/${runner.id}`);
                                                                    handleCloseSearch();
                                                                }}
                                                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/60 rounded-lg"
                                                            >
                                                                <Image
                                                                    src={runner.avatar_url}
                                                                    alt={runner.username}
                                                                    width={38}
                                                                    height={38}
                                                                    className="rounded-full"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-white">{runner.username}</p>
                                                                    <p className="text-sm text-gray-400">{String(runner.id).slice(0, 8)}...</p>
                                                                </div>
                                                            </CommandItem>
                                                        ))
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        ) : (
                                            <div className="py-8">
                                                <h3 className="text-gray-400 text-sm font-medium px-4 mb-3">TRENDING RUNNERS</h3>
                                                <CommandList className="max-h-[60vh] overflow-y-auto">
                                                    {isLoading ? (
                                                        <div className="flex justify-center py-6">
                                                            <div className="h-5 w-5 rounded-full border-2 border-r-transparent border-white/30 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        runners.slice(0, 5).map((runner) => (
                                                            <CommandItem
                                                                key={runner.id}
                                                                onSelect={() => {
                                                                    router.push(`/runner/${runner.id}`);
                                                                    handleCloseSearch();
                                                                }}
                                                                className="flex items-center justify-between px-4 py-3 cursor-pointer rounded-lg"
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
                                                                        <p className="font-medium text-white">{runner.username}</p>
                                                                        <p className="text-sm text-gray-400">{Math.floor(Math.random() * 10000)} runs</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-gray-300 font-medium">
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