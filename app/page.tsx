import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";

export default async function HomePage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, cover_image_url, price_inr, modules(lessons(id, is_free_preview))")
    .eq("is_published", true)
    .order("sort_order")
    .limit(3);

  const shaped = (courses || []).map((c: any) => {
    const lessons = (c.modules || []).flatMap((m: any) => m.lessons || []);
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      price_inr: c.price_inr,
      cover_image_url: c.cover_image_url,
      lesson_count: lessons.length,
      has_free_preview: lessons.some((l: any) => l.is_free_preview),
    };
  });

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-clay mb-4">
            Guided practice, at your pace
          </p>
          <h1 className="font-display text-5xl leading-tight text-ink mb-6">
            Move a little every day.
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            Structured courses in hip mobility, morning energy, and evening
            calm — built from years of daily practice, not a video dump.
          </p>
          <Link
            href="/courses"
            className="inline-block bg-ink text-paper px-6 py-3 rounded-card font-medium hover:bg-clay transition-colors"
          >
            Browse courses
          </Link>
        </div>
        <div className="aspect-[4/5] rounded-card bg-mist breath-ring flex items-center justify-center">
          <span className="text-ink/40 font-mono text-sm">
            [ hero practice clip ]
          </span>
        </div>
      </section>

      {/* YouTube-to-course bridge */}
      <section className="bg-mist py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl text-ink mb-2">
            From the free channel
          </h2>
          <p className="text-ink/60 mb-8 max-w-xl">
            Start with what's free on YouTube — then go deeper with the full
            course, right here.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-paper rounded-card p-4 border border-ink/10">
                <div className="aspect-video rounded-lg bg-ink/5 mb-3 flex items-center justify-center text-ink/30 text-xs font-mono">
                  YouTube embed slot
                </div>
                <p className="text-sm text-ink/70">Latest video title</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course catalog preview */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl text-ink">Courses</h2>
          <Link href="/courses" className="text-sm text-clay font-medium hover:underline">
            View all →
          </Link>
        </div>
        {shaped.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {shaped.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <div className="bg-mist rounded-card p-10 text-center">
            <p className="text-ink/60">
              No courses published yet — add your first one from{" "}
              <Link href="/admin/courses/new" className="text-clay underline">
                the admin panel
              </Link>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
