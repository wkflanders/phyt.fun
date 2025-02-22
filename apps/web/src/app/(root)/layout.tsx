"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
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

    useEffect(() => {
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

    return (
        <main className="h-screen bg-background 
            bg-primary-blotch 
            bg-blend-overlay 
            backdrop-blur-md"
        >
            <div className="h-full w-full overflow-y-hidden">
                <Sidebar />
                <Navbar />

                {/* Conditional content */}
                <div className="pl-56 pt-16 h-full">
                    {!authCheckDone ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            {/* {children} */}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
