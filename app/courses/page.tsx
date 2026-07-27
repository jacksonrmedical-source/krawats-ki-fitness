import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, price_inr")
    .eq("is_published", true)
    .order("sort_order");

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-ink mb-10">All courses</h1>

      {!courses || courses.length === 0 ? (
        <div className="bg-mist rounded-card p-16 text-center">
          <p className="font-display text-xl text-ink mb-2">Nothing here yet</p>
          <p className="text-ink/60">
            Courses added in the admin panel will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="block bg-mist rounded-card p-6 hover:bg-ink/5 transition-colors"
            >
              <h2 className="font-display text-xl text-ink mb-1">{c.title}</h2>
              <p className="text-sm text-ink/60 mb-4">{c.subtitle}</p>
              <span className="font-mono text-sm text-clay">
                {c.price_inr > 0 ? `₹${c.price_inr}` : "Free"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
