import type { HeroBlock } from "@/lib/site-template";

type HeroBlockProps = {
  block: HeroBlock;
  imageUrl: string | null;
  primaryColor: string;
  foregroundColor: string;
  backgroundColor: string;
};

export default function HeroBlockView({
  block,
  imageUrl,
  primaryColor,
  foregroundColor,
  backgroundColor,
}: HeroBlockProps) {
  return (
    <section
      id="top"
      className="relative min-h-72 overflow-hidden"
      style={{ color: foregroundColor, backgroundColor }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: primaryColor, opacity: 0.2 }}
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative flex min-h-72 flex-col justify-end gap-3 p-6 text-white">
        <h1 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
          {block.title}
        </h1>
        <p className="max-w-lg text-sm opacity-90 md:text-base">
          {block.description}
        </p>
        <a
          href={block.ctaHref}
          className="inline-flex w-fit rounded-[var(--site-radius)] px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: primaryColor, color: backgroundColor }}
        >
          {block.ctaLabel}
        </a>
      </div>
    </section>
  );
}
