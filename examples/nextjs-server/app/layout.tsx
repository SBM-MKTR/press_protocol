import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Press Protocol — Reader-funded journalism on TON",
    description: "Pay per article with BSA USD stablecoin. Payments flow directly to journalists, editors, and contributors via the x402 protocol on TON.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* Telegram Mini App SDK — harmless no-op outside Telegram */}
                <script src="https://telegram.org/js/telegram-web-app.js" async />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
