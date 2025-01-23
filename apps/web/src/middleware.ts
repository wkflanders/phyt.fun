import { NextRequest, NextResponse } from 'next/server';
import { handleAuth } from './middleware/auth';


export function middleware(req: NextRequest) {
    return handleAuth(req);
}

export const config = {
    matcher: ['/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',],
};