import { SparklesIcon } from "lucide-react";

type AiProcessingBannerProps = {
  className?: string;
};

export default function AiProcessingBanner({
  className,
}: AiProcessingBannerProps) {
  return (
    <div
      className={`bg-primary text-primary-foreground flex h-16 w-full items-center gap-3 rounded-xl px-4 sm:px-6 ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <SparklesIcon className="size-5 shrink-0" />
      <p className="min-w-0 flex-1 text-sm font-medium sm:text-base">
        Ai is process your menu this make take a while
      </p>
      <div className="bg-primary-foreground/25 hidden h-1.5 w-40 overflow-hidden rounded-full sm:block md:w-56">
        <div className="bg-primary-foreground h-full w-2/3 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
