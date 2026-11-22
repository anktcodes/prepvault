/// <reference lib="deno.ns" />

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    const { data: access, error: accessError } = await admin
      .from("user_access")
      .select("is_paid")
      .eq("user_id", user.id)
      .maybeSingle();

    if (accessError) throw accessError;

    if (access?.is_paid) {
      throw new Error("You already have premium access");
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 9900,
          currency: "INR",
          receipt: `pv_${crypto.randomUUID()}`,
          notes: {
            user_id: user.id,
          },
        }),
      }
    );

    const order = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay error:", order);
      throw new Error("Could not create payment order");
    }

    const { error: insertError } = await admin
      .from("payments")
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: 9900,
        currency: "INR",
        status: "pending",
      });

    if (insertError) throw insertError;

    return Response.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      {
        error: error instanceof Error
          ? error.message
          : "Something went wrong",
      },
      { status: 400, headers: corsHeaders }
    );
  }
});
