import { NextRequest, NextResponse } from "next/server";
import { privy } from "@/lib/privyClient";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s/, "");

    if (!token) {
        return NextResponse.json({ error: "Missing auth token" }, { status: 400 });
    }

    try {
        // const verificationKey = process.env.PRIVY_VERIFICATION_KEY!;
        const verifiedClaims = await privy.verifyAuthToken(token);

        // Find or create a user in the db

        const response = NextResponse.json({
            message: 'success',
        });

        response.cookies.set({
            name: 'phyt_session',
            value: `session-for-${verifiedClaims.userId}`,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error("Token verification failed:", error);
        return NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
        );
    }
}
