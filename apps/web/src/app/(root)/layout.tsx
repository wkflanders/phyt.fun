"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useGetUser } from "@/hooks/use-get-user";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const { user: privyUser, ready } = usePrivy();
    const { data: dbUser, error, isLoading, isFetching } = useGetUser();

    const [authCheckDone, setAuthCheckDone] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // This ref will point to the scrollable div
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // -- [1] Auth check logic (unchanged) --
        if (!ready) return;

        if (!privyUser) {
            router.push("/");
            return;
        }

        if (!isLoading && !isFetching) {
            if (error) {
                console.log(error);
                if (error.status === 404) {
                    router.push("/onboard");
                } else {
                    console.error("Server error while fetching user:", error.error);
                }
            } else if (!dbUser) {
                router.push("/onboard");
            } else {
                setAuthCheckDone(true);
            }
        }
    }, [ready, privyUser, dbUser, error, isLoading, isFetching, router]);

    // -- [2] Attach scroll listener to the scrollable div --
    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;

        function handleScroll() {
            // If container is scrolled down at all, set `scrolled` to true
            setScrolled(scrollEl!.scrollTop > 1);
        }

        scrollEl.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => {
            scrollEl.removeEventListener("scroll", handleScroll);
        };
    }, [authCheckDone]);

    return (
        <main
            className="h-screen bg-background 
                 bg-primary-blotch 
                 bg-blend-overlay 
                 backdrop-blur-md"
        >
            {/* We keep `overflow-y-hidden` here so only the child will scroll */}
            <div className="h-full w-full overflow-y-hidden">
                <Sidebar />

                {/* Pass down whether we are scrolled */}
                <Navbar scrolled={scrolled} />

                {/* The main content area that is scrollable */}
                <div className="pl-56 h-full">
                    {!authCheckDone ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto" ref={scrollRef}>
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
