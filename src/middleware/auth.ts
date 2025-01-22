import { NextRequest, NextResponse } from 'next/server';
import { privy } from '@/lib/privyClient';

const publicPaths = ['/login'];
const publicApiRoutes = [''];


export async function handleAuth(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (req.nextUrl.searchParams.get('privy_oauth_code')) return NextResponse.next();

    if (pathname.startsWith('/api/')) {
        if (publicApiRoutes.includes(pathname)) {
            return NextResponse.next();
        }

        try {
            const accessToken = req.cookies.get('privy-token');
            if (!accessToken?.value) {
                return NextResponse.json(
                    { error: 'No authentication token found' },
                    { status: 401 }
                );
            }
            await privy.verifyAuthToken(accessToken.value);

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

    const privyToken = req.cookies.get('privy-token');
    if (!privyToken?.value) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}