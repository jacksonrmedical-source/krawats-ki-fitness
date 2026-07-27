import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnrollButton from "@/components/EnrollButton";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, subtitle, description, price_inr")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, lessons(id, title, is_free_preview, duration_seconds, sort_order)")
    .eq("course_id", course.id)
    .order("sort_order");

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-clay mb-3">Course</p>
      <h1 className="font-display text-4xl text-ink mb-3">{course.title}</h1>
      <p className="text-ink/70 text-lg mb-8">{course.subtitle}</p>

      <div className="flex items-center gap-4 mb-12">
        <span className="font-mono text-xl text-ink">
          {course.price_inr > 0 ? `₹${course.price_inr}` : "Free"}
        </span>
        <EnrollButton courseId={course.id} priceInr={course.price_inr} />
      </div>

      <h2 className="font-display text-2xl text-ink mb-6">Syllabus</h2>
      <div className="space-y-6">
        {modules?.map((m: any) => (
          <div key={m.id} className="bg-mist rounded-card p-6">
            <h3 className="font-display text-lg text-ink mb-3">{m.title}</h3>
            <ul className="space-y-2">
              {m.lessons
                ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((l: any) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between text-sm py-2 border-b border-ink/10 last:border-0"
                  >
                    <span className="text-ink/80">{l.title}</span>
                    {l.is_free_preview ? (
                      <Link href={`/learn/${l.id}`} className="text-sage font-medium">
                        Free preview
                      </Link>
                    ) : (
                      <span className="text-ink/40">🔒 Locked</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
        {(!modules || modules.length === 0) && (
          <p className="text-ink/50 italic">Syllabus coming soon.</p>
        )}
      </div>
    </div>
  );
}
