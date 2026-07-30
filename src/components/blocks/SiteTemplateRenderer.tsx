import AboutBlockView from "@/components/blocks/AboutBlock";
import FooterBlockView from "@/components/blocks/FooterBlock";
import HeroBlockView from "@/components/blocks/HeroBlock";
import InviteFormBlockView from "@/components/blocks/InviteFormBlock";
import LocationBlockView from "@/components/blocks/LocationBlock";
import MenuBlockView from "@/components/blocks/MenuBlock";
import NavbarBlockView from "@/components/blocks/NavbarBlock";
import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import {
  resolveMediaUrl,
  type SiteBlock,
  type SiteTemplateMedia,
  type SiteTemplateSettings,
} from "@/lib/site-template";

type SiteTemplateRendererProps = {
  blocks: SiteBlock[];
  media: SiteTemplateMedia[];
  settings: SiteTemplateSettings;
  restaurant: SiteBuilderRestaurant;
};

export default function SiteTemplateRenderer({
  blocks,
  media,
  settings,
  restaurant,
}: SiteTemplateRendererProps) {
  const { colors } = settings;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: settings.fontFamily,
      }}
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
  );
}
