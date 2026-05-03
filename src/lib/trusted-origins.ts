/**
 * Origins for Better Auth `trustedOrigins` and `/api/auth` CORS.
 * Vercel sets `VERCEL_URL` per deployment (including previews); include it so
 * `Access-Control-Allow-Origin` matches the browser `Origin` header.
 */
export function getTrustedOrigins(): string[] {
    const fromEnv = [
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        process.env.BETTER_AUTH_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter((o): o is string => typeof o === 'string' && o.trim().length > 0);

    const legacy = [
        'http://localhost:3000',
        'https://ingredient-tuyentrans-projects.vercel.app',
        'https://ingredient.app',
        'https://ingredientimposter.xyz',
    ];

    const extra = (process.env.TRUSTED_ORIGINS ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    return [...new Set([...legacy, ...fromEnv, ...extra])];
}

/** Single origin for CORS: echo request Origin when it is trusted (required for credentials). */
export function corsAllowOriginFromRequest(request: Request): string {
    const allowed = new Set(getTrustedOrigins());
    const origin = request.headers.get('Origin');
    if (origin && allowed.has(origin)) {
        return origin;
    }
    if (process.env.NODE_ENV !== 'production') {
        return 'http://localhost:3000';
    }
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    );
}
