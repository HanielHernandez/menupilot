import Link from "next/link";

export default function PublicSiteNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold">Site not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        This restaurant site is unavailable or has not been published yet.
      </p>
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
