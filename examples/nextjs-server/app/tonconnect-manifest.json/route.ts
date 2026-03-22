import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalizeBaseUrl(value: string) {
    return value.trim().replace(/\/$/, "");
}

async function getBaseUrl() {
    const requestHeaders = await headers();
    const forwardedProto = requestHeaders.get("x-forwarded-proto");
    const forwardedHost = requestHeaders.get("x-forwarded-host");
    const host = forwardedHost ?? requestHeaders.get("host");

    if (host) {
        return `${forwardedProto ?? "https"}://${host}`;
    }

    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configured) {
        return normalizeBaseUrl(configured);
    }

    return "http://localhost:3000";
}

export async function GET() {
    const baseUrl = await getBaseUrl();

    return NextResponse.json(
        {
            url: baseUrl,
            name: "Press Protocol",
            iconUrl: `${baseUrl}/logo-text-white.png`,
            termsOfUseUrl: `${baseUrl}/about`,
            privacyPolicyUrl: `${baseUrl}/about`,
        },
        {
            headers: {
                "Cache-Control": "public, max-age=300, s-maxage=300",
                "Access-Control-Allow-Origin": "*",
            },
        },
    );
}
