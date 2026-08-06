import Image from "next/image";

export default function DashboardAppLoading() {
  return (
    <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-4 py-16">
      <Image
        src="/icon.png"
        alt="MenuPilot"
        width={64}
        height={64}
        className="animate-pulse rounded-2xl"
        priority
      />
      <p className="text-muted-foreground text-sm tracking-wide">Loading...</p>
    </div>
  );
}
