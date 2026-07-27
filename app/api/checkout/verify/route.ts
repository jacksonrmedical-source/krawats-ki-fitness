import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Called from the client after Razorpay's checkout widget succeeds.
 * We verify the signature server-side before trusting the payment —
 * never enroll a user based on a client-side "success" callback alone,
 * since that could be spoofed.
 */
export async function POST(req: NextRequest) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
    free,
  } = await req.json();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, price_inr")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Free courses skip Razorpay + signature verification entirely.
  if (free || course.price_inr === 0) {
    const admin = createServiceClient();
    const { error: insertError } = await admin.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id,
      amount_paid_inr: 0,
    });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Use the service-role client for the write so RLS can't silently reject
  // an edge case — this is a server-verified payment, not a user action.
  const admin = createServiceClient();
  const { error: insertError } = await admin.from("enrollments").insert({
    user_id: user.id,
    course_id: course.id,
    razorpay_payment_id,
    amount_paid_inr: course.price_inr,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
