"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  is_free_preview: boolean;
  video_id: string | null;
  sort_order: number;
};
type Module = { id: string; title: string; sort_order: number; lessons: Lesson[] };
type Course = { id: string; title: string; is_published: boolean };

export default function ManageCoursePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  async function load() {
    const { data: c } = await supabase
      .from("courses")
      .select("id, title, is_published")
      .eq("id", params.id)
      .single();
    setCourse(c);

    const { data: m } = await supabase
      .from("modules")
      .select("id, title, sort_order, lessons(id, title, is_free_preview, video_id, sort_order)")
      .eq("course_id", params.id)
      .order("sort_order");
    setModules((m as any) || []);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    const { error } = await supabase.from("modules").insert({
      course_id: params.id,
      title: newModuleTitle,
      sort_order: modules.length,
    });
    if (error) {
      alert(`Failed to add module: ${error.message}`);
      console.error(error);
      return;
    }
    setNewModuleTitle("");
    load();
  }

  async function addLesson(moduleId: string, title: string) {
    if (!title.trim()) return;
    const mod = modules.find((m) => m.id === moduleId);
    const { error } = await supabase.from("lessons").insert({
      module_id: moduleId,
      title,
      sort_order: mod?.lessons?.length || 0,
      is_free_preview: false,
    });
    if (error) {
      alert(`Failed to add lesson: ${error.message}`);
      console.error(error);
      return;
    }
    load();
  }

  async function toggleFreePreview(lessonId: string, current: boolean) {
    const { error } = await supabase
      .from("lessons")
      .update({ is_free_preview: !current })
      .eq("id", lessonId);
    if (error) {
      alert(`Failed to toggle preview: ${error.message}`);
      console.error(error);
      return;
    }
    load();
  }

  async function attachVideoId(lessonId: string, videoId: string) {
    const { error } = await supabase.from("lessons").update({ video_id: videoId }).eq("id", lessonId);
    if (error) {
      alert(`Failed to attach video: ${error.message}`);
      console.error(error);
      return;
    }
    load();
  }

  async function togglePublish() {
    if (!course) return;
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);
    if (error) {
      alert(`Failed to update publish state: ${error.message}`);
      console.error(error);
      return;
    }
    load();
  }

  if (!course) return <div className="max-w-4xl mx-auto px-6 py-16">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl text-ink">{course.title}</h1>
        <button
          onClick={togglePublish}
          className={`px-5 py-2.5 rounded-card text-sm font-medium ${
            course.is_published ? "bg-sage text-paper" : "bg-ink/10 text-ink"
          }`}
        >
          {course.is_published ? "Published — click to unpublish" : "Draft — click to publish"}
        </button>
      </div>

      <div className="space-y-6 mb-10">
        {modules.map((m) => (
          <ModuleCard
            key={m.id}
            module={m}
            onAddLesson={addLesson}
            onToggleFreePreview={toggleFreePreview}
            onAttachVideo={attachVideoId}
          />
        ))}
      </div>

      <div className="bg-mist rounded-card p-6 flex gap-3">
        <input
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          placeholder="New module title (e.g. Week 1)"
          className="flex-1 rounded-lg border border-ink/15 px-4 py-2.5 bg-paper"
        />
        <button
          onClick={addModule}
          className="bg-ink text-paper px-5 py-2.5 rounded-card text-sm font-medium hover:bg-clay transition-colors"
        >
          + Add module
        </button>
      </div>
    </div>
  );
}

function ModuleCard({
  module,
  onAddLesson,
  onToggleFreePreview,
  onAttachVideo,
}: {
  module: Module;
  onAddLesson: (moduleId: string, title: string) => void;
  onToggleFreePreview: (lessonId: string, current: boolean) => void;
  onAttachVideo: (lessonId: string, videoId: string) => void;
}) {
  const [newLessonTitle, setNewLessonTitle] = useState("");

  return (
    <div className="bg-mist rounded-card p-6">
      <h3 className="font-display text-lg text-ink mb-4">{module.title}</h3>

      <ul className="space-y-3 mb-4">
        {module.lessons
          ?.sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => (
            <li key={l.id} className="bg-paper rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink font-medium text-sm">{l.title}</span>
                <button
                  onClick={() => onToggleFreePreview(l.id, l.is_free_preview)}
                  className={`text-xs font-mono px-2 py-1 rounded ${
                    l.is_free_preview ? "bg-sage/20 text-sage" : "bg-ink/10 text-ink/50"
                  }`}
                >
                  {l.is_free_preview ? "Free preview" : "Locked"}
                </button>
              </div>
              <input
                defaultValue={l.video_id || ""}
                onBlur={(e) => onAttachVideo(l.id, e.target.value)}
                placeholder="Bunny Stream video ID"
                className="w-full text-xs font-mono rounded border border-ink/10 px-3 py-2 bg-paper"
              />
            </li>
          ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newLessonTitle}
          onChange={(e) => setNewLessonTitle(e.target.value)}
          placeholder="New lesson title"
          className="flex-1 text-sm rounded-lg border border-ink/15 px-3 py-2 bg-paper"
        />
        <button
          onClick={() => {
            onAddLesson(module.id, newLessonTitle);
            setNewLessonTitle("");
          }}
          className="text-sm bg-ink/10 text-ink px-4 py-2 rounded-lg hover:bg-ink/20 transition-colors"
        >
          + Lesson
        </button>
      </div>
    </div>
  );
}
