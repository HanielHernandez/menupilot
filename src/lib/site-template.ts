export type SiteTemplateMedia = {
  id: string;
  url: string;
};

export type SiteTemplateSettings = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fontFamily: string;
};

export const SITE_BLOCK_TYPES = [
  "navbar",
  "hero",
  "about",
  "menu",
  "footer",
  "location",
  "inviteForm",
] as const;

export type SiteBlockType = (typeof SITE_BLOCK_TYPES)[number];

type BlockBase<T extends SiteBlockType> = {
  id: string;
  type: T;
};

export type NavbarBlock = BlockBase<"navbar"> & {
  links: Array<{ label: string; href: string }>;
};

export type HeroBlock = BlockBase<"hero"> & {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageId: string | null;
};

export type AboutBlock = BlockBase<"about"> & {
  title: string;
  description: string;
  imageId: string | null;
};

export type MenuBlock = BlockBase<"menu"> & {
  title: string;
  description: string;
};

export type FooterBlock = BlockBase<"footer"> & {
  tagline: string;
};

export type LocationBlock = BlockBase<"location"> & {
  title: string;
  description: string;
};

export type InviteFormBlock = BlockBase<"inviteForm"> & {
  title: string;
  description: string;
  submitLabel: string;
};

export type SiteBlock =
  | NavbarBlock
  | HeroBlock
  | AboutBlock
  | MenuBlock
  | FooterBlock
  | LocationBlock
  | InviteFormBlock;

export type SiteTemplate = {
  settings: SiteTemplateSettings;
  media: SiteTemplateMedia[];
  blocks: SiteBlock[];
};

export const DEFAULT_SITE_TEMPLATE: SiteTemplate = {
  settings: {
    colors: {
      primary: "#c45c26",
      secondary: "#e8a54b",
      accent: "#3d8b6e",
      background: "#faf8f5",
      foreground: "#1f1c18",
    },
    fontFamily: "Plus Jakarta Sans",
  },
  media: [
    {
      id: "media-hero",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
    },
    {
      id: "media-about",
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    },
  ],
  blocks: [
    {
      id: "block-navbar",
      type: "navbar",
      links: [
        { label: "About", href: "#about" },
        { label: "Menu", href: "#menu" },
        { label: "Location", href: "#location" },
        { label: "Reserve", href: "#invite" },
      ],
    },
    {
      id: "block-hero",
      type: "hero",
      title: "Welcome to our table",
      description:
        "Seasonal plates, warm hospitality, and a menu built for sharing.",
      ctaLabel: "View menu",
      ctaHref: "#menu",
      imageId: "media-hero",
    },
    {
      id: "block-about",
      type: "about",
      title: "Our story",
      description:
        "We cook with local ingredients and a simple idea: good food brings people together.",
      imageId: "media-about",
    },
    {
      id: "block-menu",
      type: "menu",
      title: "Menu",
      description: "A selection of favorites from the kitchen.",
    },
    {
      id: "block-location",
      type: "location",
      title: "Find us",
      description: "Stop by for lunch, dinner, or a quick coffee.",
    },
    {
      id: "block-invite",
      type: "inviteForm",
      title: "Reserve a table",
      description: "Tell us when you’d like to visit and we’ll confirm soon.",
      submitLabel: "Send request",
    },
    {
      id: "block-footer",
      type: "footer",
      tagline: "Crafted with care.",
    },
  ],
};

export function resolveMediaUrl(
  media: SiteTemplateMedia[],
  mediaId: string | null | undefined,
): string | null {
  if (!mediaId) return null;
  return media.find((item) => item.id === mediaId)?.url ?? null;
}
