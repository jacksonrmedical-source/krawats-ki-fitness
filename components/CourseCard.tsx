import Link from "next/link";

type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  price_inr: number;
  cover_image_url: string | null;
  lesson_count?: number;
  has_free_preview?: boolean;
};

export default function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block bg-white rounded-card overflow-hidden border border-ink/10 hover:border-clay/40 hover:shadow-lg transition-all"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-mist relative overflow-hidden">
        {course.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-3xl text-ink/15">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        {course.has_free_preview && (
          <span className="absolute top-3 left-3 bg-sage text-paper text-[11px] font-mono font-medium px-2.5 py-1 rounded-full">
            Free preview
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-lg text-ink leading-snug mb-1 group-hover:text-clay transition-colors">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-sm text-ink/60 mb-3 line-clamp-2">{course.subtitle}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-ink/8">
          <span className="text-xs font-mono text-ink/50">
            {course.lesson_count ?? 0} lesson{course.lesson_count === 1 ? "" : "s"}
          </span>
          <span className="font-display text-lg text-ink">
            {course.price_inr > 0 ? `₹${course.price_inr}` : "Free"}
          </span>
        </div>
      </div>
    </Link>
  );
}
