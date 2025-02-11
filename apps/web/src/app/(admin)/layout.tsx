// src/app/(admin)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useGetUser } from "@/hooks/use-get-user";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const { user: privyUser, ready } = usePrivy();
    const { data: user, isLoading } = useGetUser();

    useEffect(() => {
        if (!ready) return;

        if (!privyUser) {
            router.push("/login");
            return;
        }

        if (!isLoading && user && user.role !== "admin") {
            router.push("/");
            return;
        }
    }, [ready, privyUser, user, isLoading, router]);

    if (!ready || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin text-phyt_blue" />
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return (
        <main className="min-h-screen bg-black">
            {children}
        </main>
    );
}