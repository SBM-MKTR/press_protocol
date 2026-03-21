"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from "react";

// Manifest must be hosted at an accessible URL for TonConnect wallet apps to validate.
// In production (Vercel), set NEXT_PUBLIC_APP_URL to your deployment URL.
// During local dev, wallet connection UI will open but deeplink validation is skipped by most wallets.
const MANIFEST_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://press-protocol.vercel.app") +
  "/tonconnect-manifest.json";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Telegram Mini App if running inside Telegram
    const twa = (window as any).Telegram?.WebApp;
    if (twa) {
      twa.ready();
      twa.expand();
    }
  }, []);

  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      {children}
    </TonConnectUIProvider>
  );
}
