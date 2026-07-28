import { createClient } from "@/lib/supabase/server";
import CourseCatalog from "@/components/CourseCatalog";

export default async function CoursesPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, subtitle, price_inr, cover_image_url, modules(lessons(id, is_free_preview))")
    .eq("is_published", true)
    .order("sort_order");

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
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-clay mb-3">
        Catalog
      </p>
      <h1 className="font-display text-4xl text-ink mb-10">All courses</h1>
      <CourseCatalog courses={shaped} />
    </div>
  );
}
