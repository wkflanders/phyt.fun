import { NextRequest, NextResponse } from 'next/server';
import { privy } from "@/lib/privyClient";

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json();

        const verifiedUser = await privy.verifyAuthToken(req.headers.get("Authorization")?.split(" ")[1] || "");

        if (verifiedUser.userId !== userData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Database insert
        const response = NextResponse.json({
            message: 'success',
            userId: userData.userId
        });

        response.cookies.set({
            name: 'phyt_session',
            value: `session-for-${userData.userId}`,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Error creating user: ', error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}