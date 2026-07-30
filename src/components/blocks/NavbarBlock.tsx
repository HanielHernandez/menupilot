import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import { getRestaurantSocialLinks } from "@/lib/restaurant-display";
import type { NavbarBlock } from "@/lib/site-template";

type NavbarBlockProps = {
  block: NavbarBlock;
  restaurant: SiteBuilderRestaurant;
  primaryColor: string;
  foregroundColor: string;
  backgroundColor: string;
};

export default function NavbarBlockView({
  block,
  restaurant,
  primaryColor,
  foregroundColor,
  backgroundColor,
}: NavbarBlockProps) {
  const logo =
    restaurant.logoUrl?.trim() ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&size=64&background=random`;
  const socials = getRestaurantSocialLinks(restaurant);

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
      style={{
        borderColor: `${foregroundColor}22`,
        backgroundColor,
        color: foregroundColor,
      }}
    >
      <a href="#top" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
        />
        <span className="text-sm font-semibold tracking-tight">
          {restaurant.name}
        </span>
      </a>

      <nav className="flex flex-wrap items-center gap-3">
        {block.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-xs font-medium opacity-80 transition-opacity hover:opacity-100"
            style={{ color: primaryColor }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {socials.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium opacity-80 transition-opacity hover:opacity-100"
              style={{ color: primaryColor }}
            >
              {social.label}
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );
}
