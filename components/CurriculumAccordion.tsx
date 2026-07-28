"use client";

import { useState } from "react";
import Link from "next/link";

type Lesson = {
  id: string;
  title: string;
  is_free_preview: boolean;
  sort_order: number;
};
type Module = {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
};

export default function CurriculumAccordion({ modules }: { modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  return (
    <div className="border border-ink/10 rounded-card overflow-hidden divide-y divide-ink/10">
      {modules.map((m) => {
        const isOpen = openId === m.id;
        const sortedLessons = [...(m.lessons || [])].sort((a, b) => a.sort_order - b.sort_order);
        return (
          <div key={m.id} className="bg-white">
            <button
              onClick={() => setOpenId(isOpen ? null : m.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-mist/60 transition-colors"
            >
              <div>
                <p className="font-display text-base text-ink">{m.title}</p>
                <p className="text-xs text-ink/50 font-mono mt-0.5">
                  {sortedLessons.length} lesson{sortedLessons.length === 1 ? "" : "s"}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-ink/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <ul className="px-5 pb-4">
                {sortedLessons.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between text-sm py-2.5 border-t border-ink/8 first:border-0"
                  >
                    <span className="flex items-center gap-2 text-ink/80">
                      <svg className="w-4 h-4 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {l.title}
                    </span>
                    {l.is_free_preview ? (
                      <Link href={`/learn/${l.id}`} className="text-sage font-medium text-xs">
                        Preview
                      </Link>
                    ) : (
                      <svg className="w-4 h-4 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </li>
                ))}
                {sortedLessons.length === 0 && (
                  <p className="text-ink/40 italic text-sm pt-2">No lessons yet.</p>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
