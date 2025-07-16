import { auth } from "@/lib/auth"; // auth is Promise<BetterAuthInstance>
import { toNextJsHandler } from "better-auth/next-js";

// Debug logging for environment variables
console.log('DEBUG ENV', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});

let handler: ReturnType<typeof toNextJsHandler> | null = null;

async function getHandler() {
    if (!handler) {
        const resolvedAuth = await auth;  // wait for async auth instance
        handler = toNextJsHandler(resolvedAuth);
    }
    return handler;
}

async function addCorsHeaders(res: Response) {
    const newHeaders = new Headers(res.headers);
    const origin = process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`)
        : "http://localhost:3000";

    newHeaders.set("Access-Control-Allow-Origin", origin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");
    return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: newHeaders,
    });
}

//export async function POST(req: Request) {
//  const h = await getHandler();
//const res = await h.POST(req);
//return addCorsHeaders(res);
//}

export async function POST(req: Request) {
    // Example: echo back the request body, or put your real logic here
    const body = await req.json();
    // ... your Gemini logic here ...
    return new Response(JSON.stringify({ message: "Public access allowed", body }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

export async function GET(req: Request) {
    const h = await getHandler();
    const res = await h.GET(req);
    return addCorsHeaders(res);
}

export async function OPTIONS() {
    const origin = process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`)
        : "http://localhost:3000";

    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        },
    });
}
