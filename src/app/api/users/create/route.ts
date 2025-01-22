import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../database/drizzle';
import { eq } from 'drizzle-orm';
import { users } from '../../../../../database/schema';
import { User } from '../../../../../types';

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json();
        const { email, username, avatar_url, privy_id, wallet_address } = userData;

        if (!email || !username) {
            return NextResponse.json(
                { error: `Email and username are required, ${email}` },
                { status: 400 }
            );
        }

        const existingUserByEmail = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUserByEmail.length > 0) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        const existingUserByUsername = await db.select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUserByUsername.length > 0) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 409 }
            );
        }

        const [newUser] = await db.insert(users)
            .values({
                email,
                username,
                avatar_url: avatar_url || 'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut',
                privy_id,
                wallet_address,
                role: 'user'
            })
            .returning();

        return NextResponse.json({
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                avatar_url: newUser.avatar_url,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error creating user: ', error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}