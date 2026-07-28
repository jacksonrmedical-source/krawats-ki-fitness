"use client";

import { useMemo, useState } from "react";
import CourseCard from "./CourseCard";

type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price_inr: number;
  cover_image_url: string | null;
  lesson_count?: number;
  has_free_preview?: boolean;
};

export default function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "price-low" | "price-high">("newest");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");

  const filtered = useMemo(() => {
    let result = courses.filter((c) => {
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.subtitle || "").toLowerCase().includes(query.toLowerCase());
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && c.price_inr === 0) ||
        (priceFilter === "paid" && c.price_inr > 0);
      return matchesQuery && matchesPrice;
    });

    if (sort === "price-low") result = [...result].sort((a, b) => a.price_inr - b.price_inr);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price_inr - a.price_inr);

    return result;
  }, [courses, query, sort, priceFilter]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-lg border border-ink/15 pl-10 pr-4 py-2.5 bg-white text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </div>

        <div className="flex gap-2">
          {(["all", "free", "paid"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPriceFilter(f)}
              className={`text-sm px-4 py-2.5 rounded-lg font-medium capitalize transition-colors ${
                priceFilter === f ? "bg-ink text-paper" : "bg-white border border-ink/15 text-ink/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="text-sm rounded-lg border border-ink/15 px-4 py-2.5 bg-white text-ink/80"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <p className="text-sm text-ink/50 mb-6 font-mono">
        {filtered.length} course{filtered.length === 1 ? "" : "s"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-mist rounded-card p-16 text-center">
          <p className="font-display text-xl text-ink mb-2">
            {courses.length === 0 ? "Nothing here yet" : "No matches"}
          </p>
          <p className="text-ink/60">
            {courses.length === 0
              ? "Courses added in the admin panel will appear here automatically."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
