import type { AboutBlock } from "@/lib/site-template";

type AboutBlockProps = {
  block: AboutBlock;
  imageUrl: string | null;
  primaryColor: string;
  foregroundColor: string;
};

export default function AboutBlockView({
  block,
  imageUrl,
  primaryColor,
  foregroundColor,
}: AboutBlockProps) {
  return (
    <section
      id="about"
      className="grid gap-6 px-6 py-10 md:grid-cols-2 md:items-center"
      style={{ color: foregroundColor }}
    >
      <div className="flex flex-col gap-3">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: primaryColor }}
        >
          About
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{block.title}</h2>
        <p className="text-sm leading-relaxed opacity-85">{block.description}</p>
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-black/5">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs opacity-50">
            No image
          </div>
        )}
      </div>
    </section>
  );
}
