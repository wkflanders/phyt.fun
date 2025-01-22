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

        return NextResponse.json(userData);

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}