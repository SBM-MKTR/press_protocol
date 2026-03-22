import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Press Protocol",
    description: "Telegram-native journalism payments on TON with transparent contributor economics.",
    metadataBase: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL)
        : new URL("http://localhost:3000"),
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#0a0f1e",
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
