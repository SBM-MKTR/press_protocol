"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect } from "react";

// Manifest must be hosted at an accessible URL for TonConnect wallet apps to validate.
// In production (Vercel), set NEXT_PUBLIC_APP_URL to your deployment URL.
// During local dev, wallet connection UI will open but deeplink validation is skipped by most wallets.
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://press-protocol-chi.vercel.app";

const MANIFEST_URL = `${APP_URL}/tonconnect-manifest.json`;

// returnStrategy: 'back' tells the wallet Mini App to return to the previous
// screen (our Mini App) after the user approves the transaction — required for
// Telegram in-app browser where deep-link navigation is intercepted.
// twaReturnUrl overrides the return destination when set (optional).
const ACTIONS_CONFIG = {
  returnStrategy: "back" as const,
  ...(process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL
    ? { twaReturnUrl: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL as `${string}://${string}` }
    : {}),
};

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
    <TonConnectUIProvider manifestUrl={MANIFEST_URL} actionsConfiguration={ACTIONS_CONFIG}>
      {children}
    </TonConnectUIProvider>
  );
}
