"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("courses")
      .insert({
        title,
        subtitle,
        description,
        price_inr: price,
        slug: slugify(title),
        is_published: false,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/admin/courses/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-8">New course</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 bg-paper"
            placeholder="Hip Mobility Course"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Subtitle</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 bg-paper"
            placeholder="Loosen up & feel free"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Price (₹)</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 bg-paper"
          />
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-paper px-6 py-3 rounded-card font-medium hover:bg-clay transition-colors disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create course"}
        </button>
      </form>
    </div>
  );
}
