import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login'];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    const sessionCookie = req.cookies.get('phyt_session');

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',],
};