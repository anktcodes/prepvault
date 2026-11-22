/// <reference lib="deno.ns" />

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function generateSignature(
  orderId: string,
  paymentId: string,
  secret: string
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}|${paymentId}`)
  );

  return toHex(signature);
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Invalid user session");
    }

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^order_[A-Za-z0-9]+$/.test(razorpay_order_id) ||
      !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id) ||
      !/^[a-fA-F0-9]{64}$/.test(razorpay_signature)
    ) {
      throw new Error("Invalid payment details");
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (paymentError) throw paymentError;

    if (!payment) {
      throw new Error("Payment order not found");
    }

    if (payment.amount !== 9900 || payment.currency !== "INR") {
      throw new Error("Invalid order amount");
    }

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const expectedSignature = await generateSignature(
      razorpay_order_id,
      razorpay_payment_id,
      secret
    );

    if (!safeCompare(expectedSignature, razorpay_signature.toLowerCase())) {
      throw new Error("Payment signature verification failed");
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;

    const razorpayResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        headers: {
          Authorization: `Basic ${btoa(`${keyId}:${secret}`)}`,
        },
      }
    );

    const razorpayPayment = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      throw new Error("Could not verify payment with Razorpay");
    }

    if (
      razorpayPayment.order_id !== razorpay_order_id ||
      razorpayPayment.amount !== 9900 ||
      razorpayPayment.currency !== "INR" ||
      razorpayPayment.status !== "captured"
    ) {
      throw new Error("Payment is not successfully captured");
    }

    if (payment.status === "paid") {
      if (payment.razorpay_payment_id !== razorpay_payment_id) {
        throw new Error("Order already paid with another payment");
      }
    } else {
      const { data: updatedPayment, error: updateError } = await admin
        .from("payments")
        .update({
          status: "paid",
          razorpay_payment_id,
          paid_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (updateError) throw updateError;

      if (!updatedPayment) {
        throw new Error("Payment record could not be updated");
      }
    }

    const { error: accessError } = await admin
      .from("user_access")
      .upsert(
        {
          user_id: user.id,
          is_paid: true,
          purchased_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (accessError) throw accessError;

    return Response.json(
      {
        success: true,
        message: "Premium access activated",
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Payment verification error:", error);

    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Payment verification failed.",
      },
      { status: 400, headers: corsHeaders }
    );
  }
});
