import { NextRequest, NextResponse } from 'next/server';
import { privy } from '@/lib/privyClient';

const publicPaths = ['/login', 'https://auth.privy.io/api/v1/oauth/callback'];
const publicApiRoutes = [''];

export async function handleAuth(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/api/')) {
        if (publicApiRoutes.includes(pathname)) {
            return NextResponse.next();
        }

        try {
            const authHeader = req.headers.get('Authorization');
            if (!authHeader?.startsWith('Bearer ')) {
                return NextResponse.json(
                    { error: 'Missing or invalid authorization header' },
                    { status: 401 }
                );
            }

            const token = authHeader.split(' ')[1];
            await privy.verifyAuthToken(token);

            return NextResponse.next();
        } catch (error) {
            console.error('API Authentication error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    }

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    const sessionCookie = req.cookies.get('phyt_session');

    if (!sessionCookie) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}