import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: { userId: string; }; }
) {
    try {
        const { userId } = await context.params;

        // Here you would:
        // 1. Fetch the user from your database
        // 2. Return any necessary user data
        const userData = {
            userId,
        };

        // Set the session cookie
        const response = NextResponse.json(userData);

        response.cookies.set({
            name: 'phyt_session',
            value: `session-for-${userId}`,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}