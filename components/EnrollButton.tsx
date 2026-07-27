"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EnrollButton({
  courseId,
  priceInr,
}: {
  courseId: string;
  priceInr: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll() {
    setLoading(true);
    setError(null);

    // Free course — skip Razorpay entirely, enroll directly.
    if (priceInr === 0) {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, free: true }),
      });
      setLoading(false);
      if (res.ok) router.refresh();
      return;
    }

    const orderRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      setError(order.error || "Could not start checkout");
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "KraWat's ki Fitness",
      description: order.courseTitle,
      theme: { color: "#1B2A4A" }, // ink, matches the site's design tokens
      handler: async (response: any) => {
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId,
          }),
        });
        setLoading(false);
        if (verifyRes.ok) {
          router.refresh();
        } else {
          setError("Payment succeeded but enrollment failed — contact support.");
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    });

    razorpay.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="bg-ink text-paper px-6 py-3 rounded-card font-medium hover:bg-clay transition-colors disabled:opacity-50"
      >
        {loading ? "Processing…" : priceInr > 0 ? "Enroll" : "Start free"}
      </button>
      {error && <p className="text-clay text-sm mt-2">{error}</p>}
    </>
  );
}
