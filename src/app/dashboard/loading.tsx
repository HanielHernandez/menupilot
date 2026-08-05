import Image from "next/image";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
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
