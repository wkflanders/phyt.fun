import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../../database/schema";
import { db } from "../../../../../database/drizzle";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    context: { params: { privyId: string; }; }
) {
    try {
        const { privyId } = await context.params;

        const [user] = await db.select()
            .from(users)
            .where(eq(users.privy_id, privyId))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
                role: user.role,
                wallet_address: user.wallet_address
            }
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}