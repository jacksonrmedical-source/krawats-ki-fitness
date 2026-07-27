export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-clay mb-4">
        About
      </p>
      <h1 className="font-display text-4xl text-ink mb-8">
        Meet Kratika Saraswat
      </h1>

      <div className="aspect-[3/2] rounded-card bg-mist mb-10 flex items-center justify-center">
        <span className="text-ink/40 font-mono text-sm">[ author photo ]</span>
      </div>

      <div className="prose-none space-y-5 text-ink/80 text-lg leading-relaxed">
        <p>
          {/* Placeholder — replace with her real bio copy */}
          A yoga trainer and fitness coach helping people build daily
          movement habits that actually stick — no fluff, just practical,
          effective routines you can do at home.
        </p>
        <p>
          {/* Placeholder — replace with her real story/credentials */}
          [ Add her training background, certifications, years of
          experience, and what led her to start teaching. ]
        </p>
        <p>
          {/* Placeholder — replace with her real mission statement */}
          [ Add a short statement on her teaching philosophy or what
          students can expect from her courses. ]
        </p>
      </div>

      <div className="mt-10 flex gap-4">
        <a
          href="https://www.youtube.com/@KratikaSaraswat21"
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay underline text-sm font-medium"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}
