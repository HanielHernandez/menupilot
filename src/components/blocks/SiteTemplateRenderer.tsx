import AboutBlockView from "@/components/blocks/AboutBlock";
import FooterBlockView from "@/components/blocks/FooterBlock";
import HeroBlockView from "@/components/blocks/HeroBlock";
import InviteFormBlockView from "@/components/blocks/InviteFormBlock";
import LocationBlockView from "@/components/blocks/LocationBlock";
import MenuBlockView from "@/components/blocks/MenuBlock";
import NavbarBlockView from "@/components/blocks/NavbarBlock";
import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import type { ExtractedCategory } from "@/lib/menu-extract";
import {
  getGoogleFontsStylesheetUrl,
  resolveMediaUrl,
  resolveSiteFonts,
  type SiteBlock,
  type SiteTemplateMedia,
  type SiteTemplateSettings,
} from "@/lib/site-template";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

type SiteTemplateRendererProps = {
  blocks: SiteBlock[];
  media: SiteTemplateMedia[];
  settings: SiteTemplateSettings;
  restaurant: SiteBuilderRestaurant;
  /** Preview chrome in the editor; full-bleed for the public page. */
  variant?: "preview" | "public";
  /** When omitted (preview), MenuBlock shows sample items. */
  menuCategories?: ExtractedCategory[];
};

export default function SiteTemplateRenderer({
  blocks,
  media,
  settings,
  restaurant,
  variant = "preview",
  menuCategories,
}: SiteTemplateRendererProps) {
  const { colors } = settings;
  const fonts = resolveSiteFonts(settings);
  const googleFontsUrl = getGoogleFontsStylesheetUrl([
    fonts.header,
    fonts.body,
  ]);

  return (
    <main
      className="h-full"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: fonts.body,
      }}
    >
      {googleFontsUrl ? <link rel="stylesheet" href={googleFontsUrl} /> : null}
      <div
        className={cn(
          "[&_h1]:[font-family:var(--site-header-font)] [&_h2]:[font-family:var(--site-header-font)] [&_h3]:[font-family:var(--site-header-font)]",
          variant === "preview" &&
            "overflow-hidden rounded-xl border border-border",
          variant === "public" && "min-h-svh w-full max-w-7xl mx-auto",
        )}
        style={
          {
            backgroundColor: colors.background,
            color: colors.foreground,
            fontFamily: fonts.body,
            ["--site-header-font" as string]: fonts.header,
            ["--site-body-font" as string]: fonts.body,
          } as CSSProperties
        }
      >
        {blocks.map((block) => {
          switch (block.type) {
            case "navbar":
              return (
                <NavbarBlockView
                  key={block.id}
                  block={block}
                  restaurant={restaurant}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  backgroundColor={colors.background}
                />
              );
            case "hero":
              return (
                <HeroBlockView
                  key={block.id}
                  block={block}
                  imageUrl={resolveMediaUrl(media, block.imageId)}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  backgroundColor={colors.background}
                />
              );
            case "about":
              return (
                <AboutBlockView
                  key={block.id}
                  block={block}
                  imageUrl={resolveMediaUrl(media, block.imageId)}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                />
              );
            case "menu":
              return (
                <MenuBlockView
                  key={block.id}
                  block={block}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  secondaryColor={colors.secondary}
                  categories={menuCategories}
                />
              );
            case "location":
              return (
                <LocationBlockView
                  key={block.id}
                  block={block}
                  restaurant={restaurant}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  secondaryColor={colors.secondary}
                />
              );
            case "inviteForm":
              return (
                <InviteFormBlockView
                  key={block.id}
                  block={block}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  backgroundColor={colors.background}
                  secondaryColor={colors.secondary}
                />
              );
            case "footer":
              return (
                <FooterBlockView
                  key={block.id}
                  block={block}
                  restaurant={restaurant}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                  backgroundColor={colors.background}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
