import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, is_published, price_inr")
    .order("sort_order");

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl text-ink">Manage courses</h1>
        <Link
          href="/admin/courses/new"
          className="bg-ink text-paper px-5 py-2.5 rounded-card text-sm font-medium hover:bg-clay transition-colors"
        >
          + New course
        </Link>
      </div>

      <div className="space-y-3">
        {courses?.map((c) => (
          <Link
            key={c.id}
            href={`/admin/courses/${c.id}`}
            className="flex items-center justify-between bg-mist rounded-card p-5 hover:bg-ink/5 transition-colors"
          >
            <div>
              <p className="font-medium text-ink">{c.title}</p>
              <p className="text-xs text-ink/50 font-mono">
                {c.is_published ? "Published" : "Draft"} · ₹{c.price_inr}
              </p>
            </div>
            <span className="text-ink/40">Manage →</span>
          </Link>
        ))}
        {(!courses || courses.length === 0) && (
          <p className="text-ink/50 italic">
            No courses yet. Create your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
