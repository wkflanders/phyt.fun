import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname === '/') {
        const sessionCookie = req.cookies.get('myapp_session');
        if (!sessionCookie) {
            // No session, go to /login
            return NextResponse.redirect(new URL('/login', req.url));
        } else {
            // Already authenticated, maybe go to /dashboard
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    const sessionCookie = req.cookies.get('phyt_session');

    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/(.*)'],
};