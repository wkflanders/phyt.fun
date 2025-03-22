"use client";

import React, { useEffect, useRef } from "react";
import { useScroll } from "@/hooks/use-scroll";
import { useRouter } from "next/navigation";
import { useGetUser } from "@/hooks/use-users";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const { data: dbUser, isFetching, status } = useGetUser();

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const scrolled = useScroll(scrollRef);

    useEffect(() => {
        if (status !== 'pending' && !isFetching && !dbUser) {
            router.push("/onboard");
        }
    }, [isFetching, dbUser, router]);

    return (
        <main className="h-screen bg-background bg-primary-blotch bg-blend-overlay backdrop-blur-lg">
            <div className="w-full h-full overflow-y-hidden">
                <Sidebar />
                <Navbar scrolled={scrolled} />
                <div className="h-full overflow-y-auto" ref={scrollRef}>
                    {children}
                </div>
            </div>
        </main>
    );
}
