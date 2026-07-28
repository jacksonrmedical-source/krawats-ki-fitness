import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import CurriculumAccordion from "@/components/CurriculumAccordion";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, subtitle, description, price_inr, cover_image_url")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, sort_order, lessons(id, title, is_free_preview, duration_seconds, sort_order)")
    .eq("course_id", course.id)
    .order("sort_order");

  const allLessons = (modules || []).flatMap((m: any) => m.lessons || []);
  const lessonCount = allLessons.length;
  const freePreviewCount = allLessons.filter((l: any) => l.is_free_preview).length;
  const moduleCount = (modules || []).length;

  return (
    <div>
      {/* Udemy-style dark hero */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_360px] gap-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-sunrise mb-3">
              Course
            </p>
            <h1 className="font-display text-4xl leading-tight mb-4">{course.title}</h1>
            <p className="text-paper/70 text-lg mb-6 max-w-xl">{course.subtitle}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/60 font-mono">
              <span>{moduleCount} module{moduleCount === 1 ? "" : "s"}</span>
              <span>·</span>
              <span>{lessonCount} lesson{lessonCount === 1 ? "" : "s"}</span>
              {freePreviewCount > 0 && (
                <>
                  <span>·</span>
                  <span className="text-sage">{freePreviewCount} free preview{freePreviewCount === 1 ? "" : "s"}</span>
                </>
              )}
            </div>
          </div>

          {/* Sticky purchase card — sits in the hero on desktop, like Udemy */}
          <div className="lg:relative">
            <div className="bg-paper text-ink rounded-card overflow-hidden shadow-2xl lg:sticky lg:top-6">
              <div className="aspect-video bg-mist flex items-center justify-center">
                {course.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-4xl text-ink/15">{course.title.charAt(0)}</span>
                )}
              </div>
              <div className="p-6">
                <p className="font-display text-3xl text-ink mb-4">
                  {course.price_inr > 0 ? `₹${course.price_inr}` : "Free"}
                </p>
                <div className="w-full [&>button]:w-full [&>button]:justify-center mb-5">
                  <EnrollButton courseId={course.id} priceInr={course.price_inr} />
                </div>
                <p className="text-xs text-ink/50 font-mono mb-4 text-center">
                  No time limit · Watch on any device
                </p>
                <ul className="space-y-2.5 text-sm text-ink/70 border-t border-ink/10 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="text-sage">✓</span> Full lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sage">✓</span> Access on mobile and desktop
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-sage">✓</span> Original, protected content
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description + curriculum */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[1fr_360px] gap-12">
        <div>
          {course.description && (
            <div className="mb-12">
              <h2 className="font-display text-2xl text-ink mb-4">About this course</h2>
              <p className="text-ink/70 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>
          )}

          <h2 className="font-display text-2xl text-ink mb-4">Curriculum</h2>
          {modules && modules.length > 0 ? (
            <CurriculumAccordion modules={modules as any} />
          ) : (
            <p className="text-ink/50 italic">Curriculum coming soon.</p>
          )}
        </div>
        {/* empty column to keep grid aligned with hero on desktop */}
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}
