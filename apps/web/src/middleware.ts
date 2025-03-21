import { NextRequest, NextResponse } from 'next/server';

const bypassAuthParams = ['privy_oauth_code', 'privy_oauth_state', 'privy_oauth_provider'];

export const config = {
    matcher: '/',
};

export function middleware(req: NextRequest) {
    for (const param of bypassAuthParams) {
        if (req.nextUrl.searchParams.get(param)) {
            return NextResponse.next();
        }
    }

    if (req.nextUrl.pathname.includes('/refresh')) return NextResponse.next();

    const cookieAuthToken = req.cookies.get('privy-token');
    const cookieSession = req.cookies.get('privy-session');

    const definitelyAuthenticated = Boolean(cookieAuthToken);

    const maybeAuthenticated = Boolean(cookieSession);

    if (!definitelyAuthenticated && maybeAuthenticated) {
        const refreshUrl = req.nextUrl.clone();
        refreshUrl.pathname = '/refresh';
        refreshUrl.searchParams.set('redirect_uri', req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(refreshUrl);
    }

    return NextResponse.next();
}