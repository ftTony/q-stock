import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-[var(--muted)]">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="qt-btn-primary mt-2 rounded-md px-4 py-2 text-sm font-medium"
      >
        Back to markets
      </Link>
    </main>
  );
}
