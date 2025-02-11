"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Aside } from "@/components/Aside/Aside";
import { useGetUser } from "@/hooks/use-get-user";
import { WalletPopover } from "@/components/WalletPopover";

export default function Layout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const { user: privyUser, ready } = usePrivy();
    const { data: dbUser, error, isLoading, isFetching } = useGetUser();
    const [authCheckDone, setAuthCheckDone] = useState(false);

    useEffect(() => {
        if (!ready) return;

        if (!privyUser) {
            router.push("/");
            return;
        }

        if (!privyUser) {
            router.push("/");
            return;
        }

        // Wait until our DB user query is no longer loading/fetching
        if (!isLoading && !isFetching) {
            // Check the error status to differentiate what happened
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
        <main className="h-screen w-full bg-pixel_mozaic overflow-hidden">
            <div className="flex h-full w-full 
                px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 2xl:px-60 
                pt-12 overflow-y-hidden">
                <Aside />
                {children}
                <div className="hidden lg:block">
                    <WalletPopover />
                </div>
            </div>
        </main>
    );
}
