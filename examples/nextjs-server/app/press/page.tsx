"use client";

import {
    decodePaymentRequired,
    encodePaymentPayload,
    generateQueryId,
    HEADER_PAYMENT_REQUIRED,
    HEADER_PAYMENT_SIGNATURE,
} from "@ton-x402/core";
import { beginCell, Address } from "@ton/core";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";

type Contributor = {
    name: string;
    role: string;
    wallet: string;
    percent: number;
};

type Article = {
    id: string;
    slug: string;
    title: string;
    author: string;
    location: string;
    category: string;
    preview: string;
    readCount: number;
    priceAtomic: string;
    priceDisplay: string;
    priceTier: string;
    contributors: Contributor[];
};

type UnlockPayload = {
    article: {
        id: string;
        title: string;
        author: string;
        content: string;
        category: string;
        location: string;
        readCount: number;
        nextPriceDisplay?: string;
        contributors: Contributor[];
    };
    payment: {
        message: string;
        pricingTier?: string;
        paymentAttemptId?: string | null;
        txHash?: string | null;
    };
};

type PaymentAttempt = {
    id: string;
    articleId: string;
    expectedAmountAtomic: string;
    assetAddress: string;
    status: string;
    network: string;
    paymentMethod?: "x402" | "tonconnect";
    payerWallet?: string | null;
    txHash?: string | null;
    createdAt: string;
    updatedAt?: string;
    confirmedPayment?: {
        id: string;
        txHash: string;
        payerWallet: string;
        totalAmountAtomic: string;
        assetAddress: string;
        network: string;
        settledAt: string;
    } | null;
    unlockGrant?: {
        id: string;
        granteeWallet: string;
        grantedAt: string;
        revokedAt: string | null;
    } | null;
};

type PaymentEndpoints = {
    unlock: string;
    content: string;
    access: string;
    paymentAttempt: string;
    paymentSubmitted: string;
};

type AccessState = {
    articleId: string;
    wallet: string | null;
    unlocked: boolean;
    unlockGrant: null | {
        id: string;
        grantedAt: string;
        confirmedPaymentId: string;
    };
    confirmedPayment: null | {
        id: string;
        paymentAttemptId: string;
        txHash: string;
        amountAtomic: string;
        assetAddress: string;
        network: string;
        settledAt: string;
    };
    paywall?: {
        priceAtomic: string;
        priceDisplay: string;
        priceTier: string;
        readCount: number;
    };
};

type ContentResponse = {
    article: {
        id: string;
        slug: string;
        title: string;
        author: string;
        location: string;
        category: string;
        content: string;
        readCount: number;
        contributors: Contributor[];
    };
    access: AccessState | null;
};

type PaymentIntentResponse = {
    paymentAttempt: PaymentAttempt;
    article: {
        id: string;
        title: string;
        priceAtomic: string;
        priceDisplay: string;
        priceTier: string;
        contributors: Contributor[];
    };
    access: AccessState | null;
    endpoints: PaymentEndpoints;
};

type TelegramContext = {
    isTelegram: boolean;
    firstName?: string;
    colorScheme?: string;
};

function getStoredAttemptKey(articleId: string) {
    return `press-protocol:payment-attempt:${articleId}`;
}

function readStoredAttemptId(articleId: string) {
    if (typeof window === "undefined") return null;

    const key = getStoredAttemptKey(articleId);
    return (
        window.sessionStorage.getItem(key) ??
        window.localStorage.getItem(key)
    );
}

function writeStoredAttemptId(articleId: string, attemptId: string | null) {
    if (typeof window === "undefined") return;

    const key = getStoredAttemptKey(articleId);
    if (!attemptId) {
        window.sessionStorage.removeItem(key);
        window.localStorage.removeItem(key);
        return;
    }

    window.sessionStorage.setItem(key, attemptId);
    window.localStorage.setItem(key, attemptId);
}

function PressPageContent() {
    const searchParams = useSearchParams();
    const articleId = searchParams.get("id") ?? "demo";

    const [article, setArticle] = useState<Article | null>(null);
    const [unlockPayload, setUnlockPayload] = useState<UnlockPayload | null>(null);
    const [paymentRequired, setPaymentRequired] = useState<any>(null);
    const [paymentAttempt, setPaymentAttempt] = useState<PaymentAttempt | null>(null);
    const [paymentEndpoints, setPaymentEndpoints] = useState<PaymentEndpoints | null>(null);
    const [status, setStatus] = useState<
        "loading" | "ready" | "awaiting_payment" | "processing" | "unlocked" | "error"
    >("loading");
    const [error, setError] = useState("");
    const [telegram, setTelegram] = useState<TelegramContext>({ isTelegram: false });

    const [tonConnectUI] = useTonConnectUI();
    const rawAddress = useTonAddress(false);
    const isConnected = rawAddress.length > 0;
    const activePrice = article?.priceDisplay ?? "Loading...";

    useEffect(() => {
        const tg = (window as any)?.Telegram?.WebApp;
        if (!tg) return;

        tg.ready?.();
        tg.expand?.();

        setTelegram({
            isTelegram: true,
            firstName: tg.initDataUnsafe?.user?.first_name,
            colorScheme: tg.colorScheme,
        });
    }, []);

    useEffect(() => {
        const tg = (window as any)?.Telegram?.WebApp;
        if (!tg?.MainButton || !tg?.BackButton) {
            return;
        }

        const handleBack = () => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }

            window.location.href = "/feed";
        };

        const handleMainButton = () => {
            if (status === "awaiting_payment") {
                if (isConnected) {
                    void handleWalletPay();
                } else {
                    tonConnectUI.openModal();
                }
                return;
            }

            if (status !== "loading" && status !== "processing" && status !== "unlocked") {
                void handlePay();
            }
        };

        tg.BackButton.show();
        tg.onEvent?.("backButtonClicked", handleBack);

        if (status === "unlocked") {
            tg.MainButton.hide();
        } else if (status === "processing" || status === "loading") {
            tg.MainButton.setParams({
                text: "Confirming payment...",
                is_visible: true,
                is_active: false,
                color: "#1e293b",
                text_color: "#94a3b8",
            });
            tg.MainButton.show();
        } else if (status === "awaiting_payment") {
            tg.MainButton.setParams({
                text: isConnected ? `Pay ${activePrice}` : "Connect TON Wallet",
                is_visible: true,
                is_active: true,
                color: isConnected ? "#14b8a6" : "#1d4ed8",
                text_color: isConnected ? "#0a0f1e" : "#ffffff",
            });
            tg.MainButton.show();
            tg.onEvent?.("mainButtonClicked", handleMainButton);
        } else if (article) {
            tg.MainButton.setParams({
                text: `Unlock for ${activePrice}`,
                is_visible: true,
                is_active: true,
                color: "#14b8a6",
                text_color: "#0a0f1e",
            });
            tg.MainButton.show();
            tg.onEvent?.("mainButtonClicked", handleMainButton);
        } else {
            tg.MainButton.hide();
        }

        return () => {
            tg.offEvent?.("backButtonClicked", handleBack);
            tg.offEvent?.("mainButtonClicked", handleMainButton);
            tg.MainButton.hide();
            tg.BackButton.hide();
        };
    }, [
        activePrice,
        article,
        articleId,
        isConnected,
        paymentAttempt,
        paymentEndpoints,
        paymentRequired,
        rawAddress,
        status,
        tonConnectUI,
    ]);

    function rememberAttempt(nextAttempt: PaymentAttempt | null, endpoints?: PaymentEndpoints | null) {
        setPaymentAttempt(nextAttempt);
        if (endpoints) {
            setPaymentEndpoints(endpoints);
        }

        writeStoredAttemptId(articleId, nextAttempt?.id ?? null);
    }

    async function fetchArticleMetadata(): Promise<Article> {
        const response = await fetch(`/api/articles/${articleId}`, {
            cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error || "Failed to load article");
        }

        return data.article as Article;
    }

    async function fetchPaymentAttemptStatus(attemptId: string) {
        const response = await fetch(`/api/payment-attempts/${attemptId}`, {
            cache: "no-store",
        });
        if (!response.ok) {
            if (response.status === 404) {
                writeStoredAttemptId(articleId, null);
                return null;
            }

            const data = await response.json().catch(() => null);
            throw new Error(data?.error || "Failed to load payment attempt status");
        }

        const data = await response.json();
        return data.paymentAttempt as PaymentAttempt;
    }

    async function fetchAccessState(wallet: string) {
        const response = await fetch(
            `/api/articles/${articleId}/access?wallet=${encodeURIComponent(wallet)}`,
            {
                cache: "no-store",
            },
        );

        const data = (await response.json().catch(() => null)) as AccessState | null;
        if (!response.ok) {
            return null;
        }

        return data;
    }

    async function syncPaymentAttempt(attemptId: string) {
        const nextAttempt = await fetchPaymentAttemptStatus(attemptId);
        if (nextAttempt) {
            rememberAttempt(nextAttempt);
        }
        return nextAttempt;
    }

    async function restoreUnlockedArticle(
        wallet: string,
        paymentOverride?: UnlockPayload["payment"],
    ) {
        const contentResponse = await fetch(
            `/api/articles/${articleId}/content?wallet=${encodeURIComponent(wallet)}`,
            {
                cache: "no-store",
            },
        );

        if (!contentResponse.ok) {
            return false;
        }

        const contentData = (await contentResponse.json()) as ContentResponse;
        const latestArticle = await fetchArticleMetadata().catch(() => article);

        if (latestArticle) {
            setArticle(latestArticle);
        }

        const confirmedPayment = contentData.access?.confirmedPayment;
        if (confirmedPayment?.paymentAttemptId) {
            writeStoredAttemptId(articleId, confirmedPayment.paymentAttemptId);
            const latestAttempt = await fetchPaymentAttemptStatus(confirmedPayment.paymentAttemptId).catch(
                () => null,
            );
            if (latestAttempt) {
                setPaymentAttempt(latestAttempt);
            }
        }

        setPaymentRequired(null);
        setUnlockPayload({
            article: {
                id: contentData.article.id,
                title: contentData.article.title,
                author: contentData.article.author,
                content: contentData.article.content,
                category: contentData.article.category,
                location: contentData.article.location,
                readCount: contentData.article.readCount,
                nextPriceDisplay: latestArticle?.priceDisplay,
                contributors: contentData.article.contributors,
            },
            payment: {
                message: paymentOverride?.message ?? "Access restored from your wallet.",
                pricingTier:
                    paymentOverride?.pricingTier ??
                    latestArticle?.priceTier ??
                    article?.priceTier,
                paymentAttemptId:
                    paymentOverride?.paymentAttemptId ??
                    confirmedPayment?.paymentAttemptId ??
                    null,
                txHash: paymentOverride?.txHash ?? confirmedPayment?.txHash ?? null,
            },
        });
        setStatus("unlocked");
        return true;
    }

    async function waitForPaymentResolution(
        wallet: string,
        attemptId: string,
        options?: {
            timeoutMs?: number;
            intervalMs?: number;
            message?: string;
            txHash?: string | null;
        },
    ) {
        const timeoutMs = options?.timeoutMs ?? 12000;
        const intervalMs = options?.intervalMs ?? 1500;
        const deadline = Date.now() + timeoutMs;

        while (Date.now() <= deadline) {
            const latestAttempt = await fetchPaymentAttemptStatus(attemptId).catch(() => null);
            if (latestAttempt) {
                rememberAttempt(latestAttempt);
            }

            const access = await fetchAccessState(wallet).catch(() => null);
            if (access?.unlocked) {
                return restoreUnlockedArticle(wallet, {
                    message: options?.message ?? "Access restored after payment confirmation.",
                    pricingTier: article?.priceTier,
                    paymentAttemptId:
                        access.confirmedPayment?.paymentAttemptId ??
                        latestAttempt?.id ??
                        attemptId,
                    txHash:
                        options?.txHash ??
                        access.confirmedPayment?.txHash ??
                        latestAttempt?.confirmedPayment?.txHash ??
                        latestAttempt?.txHash ??
                        null,
                });
            }

            if (latestAttempt?.status === "failed") {
                break;
            }

            if (Date.now() + intervalMs > deadline) {
                break;
            }

            await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
        }

        return false;
    }

    useEffect(() => {
        let cancelled = false;

        async function loadArticle() {
            setStatus("loading");
            setError("");
            setUnlockPayload(null);
            setPaymentRequired(null);
            setPaymentAttempt(null);
            setPaymentEndpoints(null);

            try {
                const nextArticle = await fetchArticleMetadata();
                if (!cancelled) {
                    setArticle(nextArticle);
                    setStatus("ready");
                }
            } catch (err) {
                if (!cancelled) {
                    setError((err as Error).message);
                    setStatus("error");
                }
            }
        }

        loadArticle();

        return () => {
            cancelled = true;
        };
    }, [articleId]);

    useEffect(() => {
        if (!article) return;

        let cancelled = false;

        async function restorePersistedState() {
            try {
                const storedAttemptId = readStoredAttemptId(articleId);
                if (storedAttemptId) {
                    const storedAttempt = await fetchPaymentAttemptStatus(storedAttemptId);
                    if (!cancelled && storedAttempt) {
                        setPaymentAttempt(storedAttempt);
                    }
                }

                if (!rawAddress) {
                    return;
                }

                const accessData = await fetchAccessState(rawAddress);

                if (!accessData?.unlocked) {
                    return;
                }

                if (accessData.confirmedPayment?.paymentAttemptId) {
                    writeStoredAttemptId(articleId, accessData.confirmedPayment.paymentAttemptId);
                    const confirmedAttempt = await fetchPaymentAttemptStatus(
                        accessData.confirmedPayment.paymentAttemptId,
                    ).catch(() => null);

                    if (!cancelled && confirmedAttempt) {
                        setPaymentAttempt(confirmedAttempt);
                    }
                }

                if (!cancelled) {
                    await restoreUnlockedArticle(rawAddress, {
                        message: "Access restored from your wallet.",
                        pricingTier: article.priceTier,
                        paymentAttemptId: accessData.confirmedPayment?.paymentAttemptId ?? null,
                        txHash: accessData.confirmedPayment?.txHash ?? null,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setError((err as Error).message);
                    setStatus("error");
                }
            }
        }

        restorePersistedState();

        return () => {
            cancelled = true;
        };
    }, [articleId, article?.id, article?.priceTier, rawAddress]);

    useEffect(() => {
        if (!rawAddress || !paymentAttempt || (status !== "awaiting_payment" && status !== "processing")) {
            return;
        }

        let cancelled = false;

        const refresh = async () => {
            if (cancelled) return;

            const restored = await waitForPaymentResolution(rawAddress, paymentAttempt.id, {
                timeoutMs: 1,
                intervalMs: 1,
                message: "Access restored after payment confirmation.",
            }).catch(() => false);

            if (cancelled || restored) {
                return;
            }

            const latestAttempt = await fetchPaymentAttemptStatus(paymentAttempt.id).catch(() => null);
            if (!cancelled && latestAttempt) {
                rememberAttempt(latestAttempt);
            }
        };

        const intervalId = window.setInterval(() => {
            void refresh();
        }, 4000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void refresh();
            }
        };

        window.addEventListener("focus", handleVisibilityChange);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        void refresh();

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleVisibilityChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [paymentAttempt, rawAddress, status]);

    const contributorTotal = useMemo(
        () =>
            (unlockPayload?.article.contributors ?? article?.contributors ?? []).reduce(
                (sum, contributor) => sum + contributor.percent,
                0,
            ),
        [article, unlockPayload],
    );

    async function handlePay() {
        if (!article) return;

        setStatus("processing");
        setError("");

        try {
            let activeAttempt = paymentAttempt;
            let endpoints = paymentEndpoints;

            if (!activeAttempt) {
                const intentResponse = await fetch(`/api/articles/${article.id}/payment-intent`, {
                    method: "POST",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        paymentMethod: "tonconnect",
                        payerWallet: rawAddress || undefined,
                    }),
                });
                const intentData = (await intentResponse.json()) as PaymentIntentResponse & {
                    error?: string;
                };

                if (!intentResponse.ok) {
                    throw new Error(intentData?.error || "Failed to create payment attempt");
                }

                activeAttempt = intentData.paymentAttempt;
                endpoints = intentData.endpoints;
                rememberAttempt(activeAttempt, endpoints);

                if (rawAddress && intentData.access?.unlocked) {
                    const restored = await restoreUnlockedArticle(rawAddress, {
                        message: "Access restored from your wallet.",
                        pricingTier: article.priceTier,
                        paymentAttemptId: intentData.access.confirmedPayment?.paymentAttemptId ?? null,
                        txHash: intentData.access.confirmedPayment?.txHash ?? null,
                    });
                    if (restored) {
                        return;
                    }
                }
            }

            const unlockResponse = await fetch(
                endpoints?.unlock ?? `/api/articles/${article.id}/unlock`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: activeAttempt?.id
                        ? { "x-press-payment-attempt-id": activeAttempt.id }
                        : undefined,
                },
            );

            if (unlockResponse.status === 402) {
                const encoded = unlockResponse.headers.get(HEADER_PAYMENT_REQUIRED);
                const details = encoded ? decodePaymentRequired(encoded) : null;
                const responseAttemptId = unlockResponse.headers.get("x-press-payment-attempt-id");

                if (responseAttemptId && (!activeAttempt || responseAttemptId !== activeAttempt.id)) {
                    const responseAttempt = await fetchPaymentAttemptStatus(responseAttemptId).catch(
                        () => null,
                    );
                    if (responseAttempt) {
                        rememberAttempt(responseAttempt, endpoints);
                    }
                }

                setPaymentRequired(details);
                setStatus("awaiting_payment");
                return;
            }

            const unlockData = await unlockResponse.json().catch(() => null);
            if (!unlockResponse.ok) {
                throw new Error(unlockData?.error || "Failed to unlock article");
            }

            if (rawAddress) {
                const restored = await restoreUnlockedArticle(rawAddress, {
                    message: unlockData?.payment?.message ?? "Payment confirmed. Full article unlocked.",
                    pricingTier: unlockData?.payment?.pricingTier ?? article.priceTier,
                    paymentAttemptId: unlockData?.payment?.paymentAttemptId ?? activeAttempt?.id ?? null,
                    txHash: unlockData?.payment?.txHash ?? null,
                });
                if (restored) {
                    return;
                }
            }

            setUnlockPayload(unlockData);
            setStatus("unlocked");
        } catch (err) {
            setError((err as Error).message);
            setStatus("error");
        }
    }

    async function handleWalletPay() {
        if (!rawAddress) {
            tonConnectUI.openModal();
            return;
        }

        if (!paymentRequired || !article || !paymentAttempt) {
            setError("Create a payment request before opening the wallet.");
            setStatus("error");
            return;
        }

        const tonOption = paymentRequired.accepts?.[0];
        if (!tonOption) {
            setError("No TON payment option in payment requirements");
            setStatus("error");
            return;
        }

        setStatus("processing");
        setError("");

        try {
            const jwRes = await fetch(
                `/api/press/jetton-wallet?owner=${encodeURIComponent(rawAddress)}`,
                {
                    cache: "no-store",
                },
            );
            if (!jwRes.ok) {
                throw new Error("Failed to resolve BSA USD wallet address");
            }

            const { walletAddress: senderJettonWallet } = await jwRes.json();
            const queryId = generateQueryId();

            const jettonTransferBody = beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(BigInt(queryId), 64)
                .storeCoins(BigInt(tonOption.amount))
                .storeAddress(Address.parse(tonOption.payTo))
                .storeAddress(Address.parse(rawAddress))
                .storeMaybeRef(null)
                .storeCoins(1_000_000n)
                .storeBit(0)
                .storeUint(0, 32)
                .storeStringTail(`x402:${queryId}`)
                .endCell();

            const result = (await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: senderJettonWallet,
                        amount: "70000000",
                        payload: jettonTransferBody.toBoc().toString("base64"),
                    },
                ],
            })) as {
                boc?: string;
                transaction?: {
                    hash?: string;
                };
            };

            const signedBoc = typeof result?.boc === "string" ? result.boc : null;
            const walletTxHash =
                typeof result?.transaction?.hash === "string" ? result.transaction.hash : undefined;

            const submittedResponse = await fetch(
                paymentEndpoints?.paymentSubmitted ??
                    `/api/payment-attempts/${paymentAttempt.id}/submitted`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        payerWallet: rawAddress,
                        queryId,
                        txHash: walletTxHash,
                        paymentMethod: "tonconnect",
                    }),
                },
            );

            const submittedData = await submittedResponse.json().catch(() => null);
            if (!submittedResponse.ok) {
                throw new Error(submittedData?.error || "Failed to persist submitted payment attempt");
            }

            if (submittedData?.paymentAttempt) {
                rememberAttempt(submittedData.paymentAttempt, paymentEndpoints);
            }

            await syncPaymentAttempt(paymentAttempt.id).catch(() => null);

            if (!signedBoc) {
                const restored = await waitForPaymentResolution(rawAddress, paymentAttempt.id, {
                    timeoutMs: 12000,
                    intervalMs: 1500,
                    message: "Access restored after wallet confirmation.",
                    txHash: walletTxHash ?? null,
                });

                if (restored) {
                    return;
                }

                setError(
                    "Your wallet returned to the app without a verifiable signed payload. If the payment completed, reconnect the same wallet and access will restore automatically. For the live demo, Tonkeeper testnet is the safest wallet path.",
                );
                setStatus("awaiting_payment");
                return;
            }

            const encodedPayload = encodePaymentPayload({
                scheme: "ton-v1",
                network: tonOption.network,
                boc: signedBoc,
                fromAddress: rawAddress,
                queryId,
            });

            const unlockHeaders: Record<string, string> = {
                [HEADER_PAYMENT_SIGNATURE]: encodedPayload,
                "x-press-payment-attempt-id": paymentAttempt.id,
            };

            const unlockResponse = await fetch(
                paymentEndpoints?.unlock ?? `/api/articles/${article.id}/unlock`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: unlockHeaders,
                },
            );

            const unlockData = await unlockResponse.json().catch(() => null);
            const latestAttempt = await syncPaymentAttempt(paymentAttempt.id).catch(() => null);

            if (!unlockResponse.ok) {
                if (latestAttempt?.unlockGrant) {
                    const restored = await restoreUnlockedArticle(rawAddress, {
                        message: "Access restored after payment confirmation.",
                        pricingTier: article.priceTier,
                        paymentAttemptId: latestAttempt.id,
                        txHash:
                            latestAttempt.confirmedPayment?.txHash ??
                            latestAttempt.txHash ??
                            null,
                    });
                    if (restored) {
                        return;
                    }
                }

                const recovered = await waitForPaymentResolution(rawAddress, paymentAttempt.id, {
                    timeoutMs: 12000,
                    intervalMs: 1500,
                    message: "Access restored after payment confirmation.",
                    txHash:
                        latestAttempt?.confirmedPayment?.txHash ??
                        latestAttempt?.txHash ??
                        walletTxHash ??
                        null,
                });

                if (recovered) {
                    return;
                }

                if (latestAttempt?.status === "submitted") {
                    setError(
                        "Payment was submitted but confirmation is still pending. Keep this page open or return with the same wallet and the article will restore automatically once settlement completes.",
                    );
                    setStatus("awaiting_payment");
                    return;
                }

                throw new Error(unlockData?.error || "Payment confirmation failed");
            }

            const restored = await restoreUnlockedArticle(rawAddress, {
                message: unlockData?.payment?.message ?? "Payment confirmed. Full article unlocked.",
                pricingTier: unlockData?.payment?.pricingTier ?? article.priceTier,
                paymentAttemptId: unlockData?.payment?.paymentAttemptId ?? paymentAttempt.id,
                txHash:
                    unlockData?.payment?.txHash ??
                    latestAttempt?.confirmedPayment?.txHash ??
                    latestAttempt?.txHash ??
                    null,
            });

            if (!restored) {
                setUnlockPayload(unlockData);
                setStatus("unlocked");
            }
        } catch (err) {
            const message = (err as Error).message;
            if (
                message.toLowerCase().includes("user rejected") ||
                message.toLowerCase().includes("user declined")
            ) {
                setStatus("awaiting_payment");
                return;
            }

            setError(message);
            setStatus("error");
        }
    }

    const visibleContributors = unlockPayload?.article.contributors ?? article?.contributors ?? [];
    const unlockMessage = unlockPayload?.payment.message;
    const unlockTxHash = unlockPayload?.payment.txHash;

    return (
        <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                    <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ background: "#14b8a6", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0a0f1e" }}>P</div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Press Protocol</span>
                    </a>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                        {isConnected ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 20, padding: "4px 12px" }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#14b8a6" }} />
                                <span style={{ fontSize: 12, color: "#14b8a6" }}>
                                    {rawAddress.slice(0, 4)}…{rawAddress.slice(-4)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={() => tonConnectUI.openModal()}
                                style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer" }}
                            >
                                Connect Wallet
                            </button>
                        )}
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                            {telegram.isTelegram
                                ? `Telegram${telegram.firstName ? ` · ${telegram.firstName}` : ""}`
                                : "Web preview"}
                        </span>
                    </div>
                </div>

                {telegram.isTelegram && (
                    <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 12, padding: "10px 14px", marginBottom: "1rem" }}>
                        <div style={{ fontSize: 13, color: "#14b8a6", fontWeight: 600, marginBottom: 4 }}>Telegram Mini App mode</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            In-chat reading · wallet handoff · theme: {telegram.colorScheme ?? "default"}
                        </div>
                    </div>
                )}

                {status === "loading" && (
                    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", color: "#94a3b8" }}>
                        Loading article...
                    </div>
                )}

                {status === "error" && (
                    <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Something went wrong</div>
                        <div style={{ fontSize: 13, color: "#fecaca" }}>{error}</div>
                    </div>
                )}

                {article && (
                    <>
                        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                            <span style={{ background: "#14b8a622", color: "#14b8a6", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.category}</span>
                            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.location}</span>
                            <span style={{ background: "#1e293b", color: "#94a3b8", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.readCount.toLocaleString()} readers</span>
                            <span style={{ background: "#1d4ed822", color: "#93c5fd", padding: "4px 10px", borderRadius: 20, fontSize: 12 }}>{article.priceTier} tier</span>
                        </div>

                        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>{article.title}</h1>
                        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: "1.25rem" }}>
                            By {article.author} · Pay once, reward every contributor behind the story.
                        </p>

                        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: "1.25rem", marginBottom: "1rem" }}>
                            <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.8, marginBottom: "1rem" }}>{article.preview}</div>
                            {status === "unlocked" && unlockPayload ? (
                                <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.8 }}>
                                    {unlockPayload.article.content.split("\n\n").map((paragraph, index) => (
                                        <p key={index} style={{ marginBottom: "1rem" }}>{paragraph}</p>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ position: "relative" }}>
                                    <p style={{ fontSize: 15, lineHeight: 1.8, color: "#cbd5e1", filter: "blur(4px)", userSelect: "none", margin: 0 }}>
                                        Unlocking reveals the full investigation, the field reporting, the accountability details, and the evidence gathered on the ground. Payment is what turns this article from a platform asset into direct income for the people who produced it.
                                    </p>
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, #0f172a)" }} />
                                </div>
                            )}
                        </div>

                        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 18, padding: "1.25rem", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Current unlock price</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: "#14b8a6" }}>{activePrice}</div>
                                </div>
                                <div style={{ fontSize: 12, color: "#94a3b8", maxWidth: 240, textAlign: "right" }}>
                                    Prices rise with readership. Early supporters fund the reporting before it becomes established.
                                </div>
                            </div>

                            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                                Contributor split · {contributorTotal}%
                            </div>
                            {visibleContributors.map((contributor) => (
                                <div key={`${contributor.role}-${contributor.name}`} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 96, fontSize: 13, color: "#e2e8f0" }}>{contributor.role}</div>
                                    <div style={{ flex: 1, background: "#1e293b", borderRadius: 999, overflow: "hidden", height: 8 }}>
                                        <div style={{ width: `${contributor.percent}%`, background: "#14b8a6", height: "100%" }} />
                                    </div>
                                    <div style={{ width: 42, textAlign: "right", fontSize: 13, color: "#14b8a6", fontWeight: 700 }}>{contributor.percent}%</div>
                                </div>
                            ))}
                            <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
                                Splits shown are distribution targets. Atomic per-contributor on-chain routing is in development.
                            </p>
                        </div>

                        {status === "awaiting_payment" && paymentRequired && (
                            <div style={{ background: "#082f49", border: "1px solid #0ea5e9", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Payment request ready</div>
                                <div style={{ fontSize: 12, color: "#bfdbfe", fontFamily: "monospace", marginBottom: 12 }}>
                                    {paymentRequired.accepts?.[0]?.amount} atomic BSA USD → {paymentRequired.accepts?.[0]?.payTo?.slice(0, 10)}…
                                    {paymentAttempt && (
                                        <span style={{ display: "block", marginTop: 4, color: "#93c5fd" }}>
                                            attempt: {paymentAttempt.id} · {paymentAttempt.status}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: "#dbeafe", marginBottom: 12, lineHeight: 1.6 }}>
                                    Approve the payment in your wallet, then return here. If the app is reopened or the wallet reconnects, Press Protocol will re-check your persisted access automatically.
                                </div>
                                <div style={{ fontSize: 12, color: "#dbeafe", marginBottom: 12, lineHeight: 1.6 }}>
                                    The article price is {activePrice} in BSA USD. Some wallets also show a separate TON amount for jetton-routing gas when they open the approval sheet.
                                </div>
                                {!isConnected ? (
                                    <button
                                        onClick={() => tonConnectUI.openModal()}
                                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1d4ed8", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Connect TON Wallet to Pay
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleWalletPay}
                                        style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#14b8a6", color: "#0a0f1e", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Pay {activePrice} with TON Wallet
                                    </button>
                                )}
                            </div>
                        )}

                        {status === "unlocked" && unlockPayload && (
                            <div style={{ background: "#14b8a611", border: "1px solid #14b8a633", borderRadius: 16, padding: "1rem", marginBottom: "1rem" }}>
                                <div style={{ fontSize: 14, color: "#14b8a6", fontWeight: 700, marginBottom: 6 }}>Article unlocked</div>
                                <div style={{ fontSize: 13, color: "#d1fae5", marginBottom: 6 }}>{unlockMessage}</div>
                                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                                    Reader count is now {unlockPayload.article.readCount.toLocaleString()}.
                                    {unlockPayload.article.nextPriceDisplay
                                        ? ` Current market price: ${unlockPayload.article.nextPriceDisplay}.`
                                        : ""}
                                </div>
                                {unlockTxHash && (
                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, fontFamily: "monospace" }}>
                                        tx: {unlockTxHash}
                                    </div>
                                )}
                            </div>
                        )}

                        {status !== "unlocked" && status !== "awaiting_payment" && (
                            <button
                                onClick={handlePay}
                                disabled={status === "processing" || status === "loading"}
                                style={{
                                    width: "100%",
                                    padding: "15px 16px",
                                    borderRadius: 14,
                                    border: "none",
                                    background: status === "processing" ? "#1e293b" : "#14b8a6",
                                    color: status === "processing" ? "#94a3b8" : "#0a0f1e",
                                    fontSize: 15,
                                    fontWeight: 800,
                                    cursor: status === "processing" ? "default" : "pointer",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                {status === "processing" ? "Confirming on TON blockchain…" : `Pay ${activePrice} to unlock`}
                            </button>
                        )}

                        <div style={{ textAlign: "center", fontSize: 12, color: "#64748b" }}>
                            Telegram-native reading · TON settlement · persistent wallet-based unlocks
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PressPage() {
    return (
        <Suspense
            fallback={
        <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "white", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.25rem 1rem 3rem" }}>
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem", color: "#94a3b8" }}>
                    Loading article shell...
                </div>
            </div>
        </div>
            }
        >
            <PressPageContent />
        </Suspense>
    );
}
