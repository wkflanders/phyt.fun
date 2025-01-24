import { NextResponse } from "next/server";
import { imagekit } from '@/lib/imagekit';

export async function GET() {
    try {
        const authParams = imagekit.getAuthenticationParameters();
        return NextResponse.json(authParams);
    } catch (error) {
        console.error('ImageKit auth error:', error);
        return NextResponse.json(
            { error: 'Failed to generate authentication parameters' },
            { status: 500 }
        );
    }
}