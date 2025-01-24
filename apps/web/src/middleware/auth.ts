import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login'];

export async function handleAuth(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (req.nextUrl.searchParams.get('privy_oauth_code')) return NextResponse.next();

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