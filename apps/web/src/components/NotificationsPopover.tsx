"use client";
import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
// import { useGetNotifications } from "@/hooks/use-get-notifications";

export const NotificationsPopover = () => {
    // const { data: notifications, isLoading } = useGetNotifications();

    const notifications: { message: string; time: string; }[] = [];
    const isLoading = false;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="rounded-xl hover:bg-black/20 data-[state=open]:bg-black/20">
                    <Bell size={20} className="text-text" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-80 mt-2.5 bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-lg text-text">Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-8 h-8 animate-spin text-text-dim" />
                        </div>
                    ) : notifications && notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div key={index} className="py-2 border-b border-white/10 last:border-0">
                                <p className="text-sm text-text">{notification.message}</p>
                                <p className="text-xs text-text-dim">{notification.time}</p>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-text-dim">No notifications</p>
                    )}
                </CardContent>
            </PopoverContent>
        </Popover>
    );
};
