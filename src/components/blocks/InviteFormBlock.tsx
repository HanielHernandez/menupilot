"use client";

import { submitTableRequestAction } from "@/app/actions/table-request";
import type { InviteFormBlock } from "@/lib/site-template";
import { useState, useTransition } from "react";

type InviteFormBlockProps = {
  block: InviteFormBlock;
  restaurantSlug: string;
  isPreview?: boolean;
  primaryColor: string;
  foregroundColor: string;
  backgroundColor: string;
  secondaryColor: string;
};

export default function InviteFormBlockView({
  block,
  restaurantSlug,
  isPreview = false,
  primaryColor,
  foregroundColor,
  backgroundColor,
  secondaryColor,
}: InviteFormBlockProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isPreview) {
      setSuccess("Preview only — requests are sent on the published site.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    startTransition(async () => {
      const result = await submitTableRequestAction({
        restaurantSlug,
        name,
        email,
        message,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess("Request sent! The restaurant will get back to you soon.");
      form.reset();
    });
  };

  return (
    <section
      id="invite"
      className="flex flex-col gap-4 overflow-hidden rounded-[var(--site-radius)] px-6 py-10"
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
      <form className="grid gap-3" onSubmit={onSubmit}>
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          disabled={isPending}
          className="h-9 rounded-[var(--site-radius)] border bg-transparent px-3 text-sm outline-none disabled:opacity-60"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          disabled={isPending}
          className="h-9 rounded-[var(--site-radius)] border bg-transparent px-3 text-sm outline-none disabled:opacity-60"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        <textarea
          name="message"
          required
          placeholder="Date, time, party size"
          rows={3}
          disabled={isPending}
          className="rounded-[var(--site-radius)] border bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60"
          style={{ borderColor: `${secondaryColor}aa` }}
        />
        {error ? (
          <p className="text-sm" style={{ color: "#c0392b" }}>
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm" style={{ color: primaryColor }}>
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-fit rounded-[var(--site-radius)] px-4 py-2 text-sm font-medium disabled:opacity-60"
          style={{ backgroundColor: primaryColor, color: backgroundColor }}
        >
          {isPending ? "Sending..." : block.submitLabel}
        </button>
      </form>
    </section>
  );
}
