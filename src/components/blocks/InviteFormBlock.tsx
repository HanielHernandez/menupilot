"use client";

import type { InviteFormBlock } from "@/lib/site-template";

type InviteFormBlockProps = {
  block: InviteFormBlock;
  primaryColor: string;
  foregroundColor: string;
  backgroundColor: string;
  secondaryColor: string;
};

export default function InviteFormBlockView({
  block,
  primaryColor,
  foregroundColor,
  backgroundColor,
  secondaryColor,
}: InviteFormBlockProps) {
  return (
    <section
      id="invite"
      className="flex flex-col gap-4 px-6 py-10"
      style={{ color: foregroundColor }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: primaryColor }}
        >
          Reserve
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{block.title}</h2>
        <p className="text-sm opacity-85">{block.description}</p>
      </div>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Your name"
          className="h-9 rounded-md border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="h-9 rounded-md border bg-transparent px-3 text-sm outline-none"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        <textarea
          name="message"
          placeholder="Date, time, party size"
          rows={3}
          className="rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        <button
          type="submit"
          className="inline-flex w-fit rounded-md px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: primaryColor, color: backgroundColor }}
        >
          {block.submitLabel}
        </button>
      </form>
    </section>
  );
}
