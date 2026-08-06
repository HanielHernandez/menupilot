import Image from "next/image";

export function AuthLogo() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <Image
        src="/logo.png"
        alt="MenuPilot"
        width={64}
        height={64}
        className="rounded-2xl"
        priority
      />
      <span className="text-lg font-semibold tracking-tight">MenuPilot</span>
    </div>
  );
}
