import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../database/drizzle';
import { users } from '../../../../../database/schema';
import { User } from '../../../../../types';

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json();



        const response = NextResponse.json({
            message: 'success',
            userId: userData.userId
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