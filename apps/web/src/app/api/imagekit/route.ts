import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_KEY!;
const privateKey = process.env.IMAGEKIT_SECRET_KEY!;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT!;

const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

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