import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates a Razorpay order for a course purchase. Called from the client
 * right before opening the Razorpay checkout widget.
 *
 * We never trust a price sent from the browser — the amount is looked up
 * server-side from the `courses` table so it can't be tampered with.
 */
export async function POST(req: NextRequest) {
  const { courseId } = await req.json();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, price_inr, is_published")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();

  if (error || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Already enrolled? Don't create a duplicate order.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
  }

  const amountPaise = course.price_inr * 100; // Razorpay expects paise

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `course_${course.id}_${user.id}`.slice(0, 40),
      notes: { course_id: course.id, user_id: user.id },
    }),
  });

  if (!razorpayRes.ok) {
    const errText = await razorpayRes.text();
    return NextResponse.json({ error: errText }, { status: 500 });
  }

  const order = await razorpayRes.json();

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    courseTitle: course.title,
  });
}
