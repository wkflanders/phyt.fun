"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "../ui/button";

type ProfilePopoverProps = {
    avatarUrl?: string;
    username?: string;
};


export const ProfilePopover = ({ avatarUrl, username }: ProfilePopoverProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-4 px-4 py-2 transition-colors duration-200 group rounded-xl hover:bg-black/20 hover:cursor-pointer"
                >
                    <Image
                        src={avatarUrl || "/fallback-avatar.png"}
                        alt={`${username || "Profile"} avatar`}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                    <span className="text-sm font-medium">{username}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="center" className="w-60 bg-zinc-900/30 backdrop-blur-xl border border-white/10 shadow-lg">
                <div className="flex flex-col gap-2">
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        View Profile
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Activity
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Offers
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Listings
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Competitions
                    </Link>
                    <hr className="my-1" />
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Runs
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Progress
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Performance
                    </Link>
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Integrations
                    </Link>
                    <hr className="my-1" />
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Help
                    </Link>
                    <hr className="my-1" />
                    <Link href="/profile" className="p-3 hover:bg-black/20 rounded">
                        Logout
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
};
