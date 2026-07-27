import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KraWat's ki Fitness — Move at your own pace",
  description: "Guided courses for hip mobility, morning energy, and calm.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">
        <header className="border-b border-ink/10">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <a href="/" className="font-display text-2xl text-ink">
              KraWat's ki Fitness
            </a>
            <nav className="flex gap-6 text-sm font-medium text-ink/80">
              <a href="/courses" className="hover:text-ink">Courses</a>
              <a href="/dashboard" className="hover:text-ink">My Practice</a>
              <a href="/about" className="hover:text-ink">About</a>
              <a href="/login" className="hover:text-ink">Sign in</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-ink/10 mt-24">
          <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-ink/60">
            © {new Date().getFullYear()} KraWat's ki Fitness. All content is original and protected.
          </div>
        </footer>
      </body>
    </html>
  );
}
