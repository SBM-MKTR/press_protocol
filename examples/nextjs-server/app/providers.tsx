"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useEffect, useMemo } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const twaReturnUrl = process.env.NEXT_PUBLIC_TWA_RETURN_URL?.trim();
  const manifestUrl = useMemo(() => {
    const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin.replace(/\/$/, "");
      return `${currentOrigin}/tonconnect-manifest.json`;
    }

    if (configuredBaseUrl) {
      return `${configuredBaseUrl}/tonconnect-manifest.json`;
    }

    return "http://localhost:3000/tonconnect-manifest.json";
  }, []);

  useEffect(() => {
    const twa = (window as any).Telegram?.WebApp;
    if (twa) {
      twa.ready();
      twa.expand();
      twa.setHeaderColor?.("#0a0f1e");
      twa.setBackgroundColor?.("#0a0f1e");
      twa.enableClosingConfirmation?.();
    }

    const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
    if (
      configuredBaseUrl &&
      typeof window !== "undefined" &&
      window.location.origin.replace(/\/$/, "") !== configuredBaseUrl
    ) {
      console.warn(
        `NEXT_PUBLIC_APP_URL (${configuredBaseUrl}) does not match the current origin (${window.location.origin}). TonConnect should use the exact deployed origin opened by Telegram.`,
      );
    }

    if ((window as any).Telegram?.WebApp && !twaReturnUrl) {
      console.warn(
        "NEXT_PUBLIC_TWA_RETURN_URL is not configured. TonConnect in Telegram Mini Apps needs a Telegram return URL for reliable wallet handoff back into the Mini App.",
      );
    }
  }, []);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      walletsRequiredFeatures={{
        sendTransaction: {
          minMessages: 1,
        },
      }}
      actionsConfiguration={{
        returnStrategy: "back",
        twaReturnUrl: twaReturnUrl && /^tg:\/\/|^https:\/\/t\.me\//.test(twaReturnUrl)
          ? (twaReturnUrl as `${string}://${string}`)
          : undefined,
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
