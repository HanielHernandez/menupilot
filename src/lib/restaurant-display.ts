import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";

export type RestaurantSocialLink = {
  label: string;
  href: string;
};

export function getRestaurantSocialLinks(
  restaurant: SiteBuilderRestaurant,
): RestaurantSocialLink[] {
  return [
    { label: "Instagram", href: restaurant.socials.instagram },
    { label: "Facebook", href: restaurant.socials.facebook },
    { label: "TikTok", href: restaurant.socials.tiktok },
    { label: "X", href: restaurant.socials.x },
    { label: "YouTube", href: restaurant.socials.youtube },
    { label: "Website", href: restaurant.socials.website },
  ].filter((item) => Boolean(item.href?.trim()));
}

export type RestaurantContactInfo = {
  address?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
};

export function getRestaurantContactInfo(
  restaurant: SiteBuilderRestaurant,
): RestaurantContactInfo {
  return {
    address: restaurant.address?.trim() || undefined,
    phoneNumber: restaurant.phoneNumber?.trim() || undefined,
    whatsappNumber: restaurant.whatsappNumber?.trim() || undefined,
  };
}
