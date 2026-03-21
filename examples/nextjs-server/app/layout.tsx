import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Press Protocol",
    description: "Telegram-native journalism payments on TON with transparent contributor economics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
