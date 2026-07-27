import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getSignedPlaybackUrl } from "@/lib/video";

export default async function LessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, description, video_id, is_free_preview, module_id, modules(course_id)")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) notFound();

  const courseId = (lesson as any).modules?.course_id;

  // Access check: free preview OR logged-in + enrolled
  let hasAccess = lesson.is_free_preview;
  if (!hasAccess && user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    hasAccess = !!enrollment;
  }

  if (!hasAccess) {
    redirect(`/login?next=/learn/${params.lessonId}`);
  }

  // Signed, short-lived, domain-locked playback URL — never expose the raw
  // Bunny Stream URL or allow it to be reused off-site.
  const playbackUrl = lesson.video_id
    ? await getSignedPlaybackUrl(lesson.video_id)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">{lesson.title}</h1>
      <p className="text-ink/60 mb-8">{lesson.description}</p>

      <div className="aspect-video rounded-card bg-ink overflow-hidden mb-6">
        {playbackUrl ? (
          <video controls controlsList="nodownload" className="w-full h-full">
            <source src={playbackUrl} type="application/x-mpegURL" />
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-paper/50 font-mono text-sm">
            No video attached yet
          </div>
        )}
      </div>

      <button className="bg-sage text-paper px-5 py-2.5 rounded-card text-sm font-medium">
        Mark as complete
      </button>
    </div>
  );
}
