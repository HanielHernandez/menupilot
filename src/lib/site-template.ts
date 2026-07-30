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
  fonts: {
    header: string;
    body: string;
    useHeaderAsBody: boolean;
  };
};

export type TypographyPreset = {
  id: string;
  label: string;
  description: string;
  header: string;
  body: string;
};

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: "classic-italian",
    label: "Classic Italian / Fine Dining",
    description: "Looks elegant and premium.",
    header: "Playfair Display",
    body: "Inter",
  },
  {
    id: "modern-restaurant",
    label: "Modern Restaurant",
    description: "Clean, contemporary, works for almost any restaurant.",
    header: "Poppins",
    body: "Inter",
  },
  {
    id: "steakhouse-grill",
    label: "Steakhouse / Grill",
    description: "Strong and bold.",
    header: "Oswald",
    body: "Source Sans 3",
  },
  {
    id: "mexican-latin",
    label: "Mexican / Latin Restaurant",
    description: "Energetic and eye-catching.",
    header: "Bebas Neue",
    body: "Montserrat",
  },
  {
    id: "cafe-bakery",
    label: "Café / Bakery",
    description: "Warm and cozy.",
    header: "Cormorant Garamond",
    body: "Lato",
  },
  {
    id: "asian-restaurant",
    label: "Asian Restaurant",
    description: "Elegant and culturally neutral.",
    header: "Noto Serif",
    body: "Noto Sans",
  },
  {
    id: "fast-food",
    label: "Fast Food / Food Truck",
    description: "Bold and easy to read.",
    header: "Barlow Condensed",
    body: "Barlow",
  },
  {
    id: "premium-modern",
    label: "Premium Modern",
    description: "One of the most modern premium combinations.",
    header: "DM Serif Display",
    body: "Manrope",
  },
];

export const FONT_OPTIONS = Array.from(
  new Set(TYPOGRAPHY_PRESETS.flatMap((preset) => [preset.header, preset.body])),
).sort((a, b) => a.localeCompare(b));

export function findTypographyPreset(
  header: string,
  body: string,
  useHeaderAsBody = false,
): TypographyPreset | undefined {
  const resolvedBody = useHeaderAsBody ? header : body;
  return TYPOGRAPHY_PRESETS.find(
    (preset) =>
      preset.header === header &&
      preset.body === resolvedBody,
  );
}

/** Google Fonts CSS URL for the given family names. */
export function getGoogleFontsStylesheetUrl(families: string[]) {
  const unique = Array.from(
    new Set(
      families
        .map((family) => family.trim())
        .filter((family) => family && family !== "system-ui" && family !== "Georgia"),
    ),
  );

  if (!unique.length) return null;

  const query = unique
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700`)
    .join("&");

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

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
    fonts: {
      header: "Playfair Display",
      body: "Inter",
      useHeaderAsBody: false,
    },
  },
  media: [    {
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

export function resolveSiteFonts(settings: SiteTemplateSettings) {
  const header = settings.fonts.header.trim() || "Plus Jakarta Sans";
  const body = settings.fonts.useHeaderAsBody
    ? header
    : settings.fonts.body.trim() || header;
  return { header, body };
}

/** Normalize legacy single-font settings into header/body fonts. */
export function normalizeSiteSettings(
  settings: Partial<SiteTemplateSettings> & {
    fontFamily?: string;
  } = {},
  fallback: SiteTemplateSettings = DEFAULT_SITE_TEMPLATE.settings,
): SiteTemplateSettings {
  const legacyFont =
    typeof settings.fontFamily === "string" && settings.fontFamily.trim()
      ? settings.fontFamily.trim()
      : null;

  const fonts = settings.fonts;

  return {
    colors: {
      ...fallback.colors,
      ...settings.colors,
    },
    fonts: {
      header:
        fonts?.header?.trim() ||
        legacyFont ||
        fallback.fonts.header,
      body:
        fonts?.body?.trim() ||
        legacyFont ||
        fallback.fonts.body,
      useHeaderAsBody:
        typeof fonts?.useHeaderAsBody === "boolean"
          ? fonts.useHeaderAsBody
          : legacyFont
            ? true
            : fallback.fonts.useHeaderAsBody,
    },
  };
}
