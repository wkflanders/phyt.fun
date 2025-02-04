"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
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
            <div className="relative h-screen w-screen bg-phyt_bg">
                {/* <Image
                    src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFtMbRka3eIV0DWvzEjTGN8LRyCBrUu2QqfF5J"
                    alt="auth-img"
                    fill
                    className="object-cover opacity-10"
                /> */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Image
                        src="https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFduORvackTPlRILfDrtYWge59yzhSjpFisE6v"
                        alt="logo"
                        width={400}
                        height={400}
                    />
                    <div className="mt-4 text-phyt_text text-xl flex items-center">
                        <span>Loading</span>
                        <span className="flex ml-1">
                            <span style={{ animationDelay: "0s" }} className="inline-block animate-bounce">.</span>
                            <span style={{ animationDelay: ".2s" }} className="inline-block animate-bounce">.</span>
                            <span style={{ animationDelay: ".4s" }} className="inline-block animate-bounce">.</span>
                        </span>
                    </div>
                </div>
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
