import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import type { LocationBlock } from "@/lib/site-template";

type LocationBlockProps = {
  block: LocationBlock;
  restaurant: SiteBuilderRestaurant;
  primaryColor: string;
  foregroundColor: string;
  secondaryColor: string;
};

export default function LocationBlockView({
  block,
  restaurant,
  primaryColor,
  foregroundColor,
  secondaryColor,
}: LocationBlockProps) {
  return (
    <section
      id="location"
      className="flex flex-col gap-4 px-6 py-10"
      style={{ color: foregroundColor }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: primaryColor }}
        >
          Location
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{block.title}</h2>
        <p className="text-sm opacity-85">{block.description}</p>
      </div>
      <div
        className="rounded-lg border p-4 text-sm"
        style={{ borderColor: `${secondaryColor}88` }}
      >
        <p className="font-medium">{restaurant.name}</p>
        {restaurant.address ? (
          <p className="mt-1 opacity-85">{restaurant.address}</p>
        ) : (
          <p className="mt-1 opacity-60">Address coming soon</p>
        )}
        {restaurant.phoneNumber ? (
          <p className="mt-2 opacity-85">{restaurant.phoneNumber}</p>
        ) : null}
      </div>
    </section>
  );
}
