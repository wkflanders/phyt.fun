import { NextRequest, NextResponse } from 'next/server';

// These parameters in the URL indicate an OAuth flow is in progress
const bypassAuthParams = ['privy_oauth_code', 'privy_oauth_state', 'privy_oauth_provider'];

export const config = {
    // This matcher applies the middleware to all routes EXCEPT:
    // - /login (your auth page)
    // - /refresh (your auth check page)
    // - Various Next.js internal routes
    matcher: ['/((?!login|refresh|api|_next/static|_next/image|favicon.ico).*)']
};

export function middleware(req: NextRequest) {
    // Always bypass if OAuth params are present
    for (const param of bypassAuthParams) {
        if (req.nextUrl.searchParams.get(param)) {
            return NextResponse.next();
        }
    }

    // Get auth cookies
    const cookieAuthToken = req.cookies.get('privy-token');
    const cookieSession = req.cookies.get('privy-session');

    const definitelyAuthenticated = Boolean(cookieAuthToken);
    const maybeAuthenticated = Boolean(cookieSession);

    // If user has a session but no auth token, redirect to refresh
    if (!definitelyAuthenticated && maybeAuthenticated) {
        const refreshUrl = req.nextUrl.clone();
        refreshUrl.pathname = '/refresh';
        refreshUrl.searchParams.set('redirect_uri', req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(refreshUrl);
    }

    // If no session at all, redirect to login
    if (!definitelyAuthenticated && !maybeAuthenticated) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}