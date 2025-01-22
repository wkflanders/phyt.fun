import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../database/drizzle';
import { users } from '../../../../../database/schema';

export async function POST(req: NextRequest): Promise<User | null> {
    try {
        const userData = await req.json();

        const newUser = db.insert(users).values({

        });

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
            maxAge: 30 * 60 * 60 * 24, // 24 hours
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