import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import {
  getRestaurantContactInfo,
  getRestaurantSocialLinks,
} from "@/lib/restaurant-display";
import type { FooterBlock } from "@/lib/site-template";

type FooterBlockProps = {
  block: FooterBlock;
  restaurant: SiteBuilderRestaurant;
  primaryColor: string;
  foregroundColor: string;
  backgroundColor: string;
};

export default function FooterBlockView({
  block,
  restaurant,
  primaryColor,
  foregroundColor,
  backgroundColor,
}: FooterBlockProps) {
  const socials = getRestaurantSocialLinks(restaurant);
  const contact = getRestaurantContactInfo(restaurant);
  const hasContact =
    Boolean(contact.address) ||
    Boolean(contact.phoneNumber) ||
    Boolean(contact.whatsappNumber);

  return (
    <footer
      className="flex flex-col gap-4 border-t px-6 py-8"
      style={{
        borderColor: `${foregroundColor}18`,
        backgroundColor,
        color: foregroundColor,
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">{restaurant.name}</p>
        <p className="text-sm opacity-80">{block.tagline}</p>
      </div>

      {hasContact ? (
        <div className="flex flex-col gap-1 text-sm opacity-85">
          {contact.address ? <p>{contact.address}</p> : null}
          {contact.phoneNumber ? (
            <a href={`tel:${contact.phoneNumber}`} className="hover:opacity-100">
              {contact.phoneNumber}
            </a>
          ) : null}
          {contact.whatsappNumber ? (
            <a
              href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: primaryColor }}
            >
              WhatsApp {contact.whatsappNumber}
            </a>
          ) : null}
        </div>
      ) : null}

      {socials.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium"
              style={{ color: primaryColor }}
            >
              {social.label}
            </a>
          ))}
        </div>
      ) : null}
    </footer>
  );
}
