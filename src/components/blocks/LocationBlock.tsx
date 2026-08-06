import type { SiteBuilderRestaurant } from "@/components/SiteBuilderProvider";
import { formatScheduleRow } from "@/lib/restaurant-schedule";
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
  const schedule = restaurant.schedule ?? [];

  return (
    <section
      id="location"
      className="flex flex-col gap-4 overflow-hidden px-6 py-10"
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
        className="rounded-[var(--site-radius)] border p-4 text-sm"
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

        {schedule.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-1.5 border-t pt-3 opacity-85" style={{ borderColor: `${secondaryColor}66` }}>
            {schedule.map((entry, index) => {
              const label = formatScheduleRow(entry);
              const [day, hours] = label.split("\t");
              return (
                <li
                  key={`${entry.day}-${index}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4"
                >
                  <span>{day}</span>
                  <span className="text-right whitespace-nowrap">
                    {hours ?? ""}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
