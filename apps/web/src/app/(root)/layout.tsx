"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Aside } from "@/components/Aside/Aside";
import { useGetUser } from "@/hooks/use-get-user";

export default function Layout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const { user: privyUser, ready } = usePrivy();
    const { data: dbUser, error, isLoading, isFetching } = useGetUser();
    const [authCheckDone, setAuthCheckDone] = useState(false);

    useEffect(() => {
        if (!ready) return;

        // If we never got a privyUser at all, we know we can't proceed
        if (!privyUser) {
            router.push("/onboard");
            return;
        }

        // Now we wait until our DB user query is no longer loading
        if (!isLoading && !isFetching) {
            // If the query ended in error or we have no DB user, redirect
            if (error || !dbUser) {
                router.push("/onboard");
            } else {
                // We have a DB user, so we can render the app
                setAuthCheckDone(true);
            }
        }
    }, [ready, privyUser, dbUser, error, isLoading, isFetching, router]);

    if (!authCheckDone) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-phyt_bg">
                <p className="text-xl font-inter text-phyt_text_dark">Loading...</p>
            </div>
        );
    }

    return (
        <main className="h-screen w-full bg-phyt_gray">
            <div className="flex h-full w-full">
                <Aside />
                {children}
            </div>
        </main>
    );
}
