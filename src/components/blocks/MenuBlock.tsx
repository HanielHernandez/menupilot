import type { ExtractedCategory } from "@/lib/menu-extract";
import type { MenuBlock } from "@/lib/site-template";

type MenuBlockProps = {
  block: MenuBlock;
  primaryColor: string;
  foregroundColor: string;
  secondaryColor: string;
  /** Real menu for public pages. Omit in preview to use sample items. */
  categories?: ExtractedCategory[];
};

const SAMPLE_CATEGORIES: ExtractedCategory[] = [
  {
    name: "Starters",
    description: "Sample category for preview",
    sort: 0,
    items: [
      {
        name: "House salad",
        price: 12,
        description: "Seasonal greens, citrus vinaigrette",
      },
      {
        name: "Wood-fired flatbread",
        price: 16,
        description: "Tomato, herbs, soft cheese",
      },
    ],
  },
  {
    name: "Mains",
    description: "Sample category for preview",
    sort: 1,
    items: [
      {
        name: "Catch of the day",
        price: 28,
        description: "Ask your server for today’s plate",
      },
      {
        name: "Herb roasted chicken",
        price: 24,
        description: "Pan jus, seasonal vegetables",
      },
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function MenuBlockView({
  block,
  primaryColor,
  foregroundColor,
  secondaryColor,
  categories,
}: MenuBlockProps) {
  const isPreview = categories === undefined;
  const menuCategories = isPreview ? SAMPLE_CATEGORIES : categories;

  return (
    <section
      id="menu"
      className="flex flex-col gap-8 px-6 py-10"
      style={{ color: foregroundColor }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: primaryColor }}
        >
          Menu
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{block.title}</h2>
        <p className="text-sm opacity-85">{block.description}</p>
        {isPreview ? (
          <p className="text-xs opacity-60">
            Preview uses sample dishes. Your live site shows real menu items.
          </p>
        ) : null}
      </div>

      {!isPreview && menuCategories.length === 0 ? (
        <p className="text-sm opacity-70">Menu coming soon.</p>
      ) : (
        menuCategories.map((category) => (
          <div
            key={category.id ?? category.name}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold tracking-tight">
                {category.name}
              </h3>
              {category.description ? (
                <p className="text-sm opacity-75">{category.description}</p>
              ) : null}
            </div>

            {category.items.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {category.items.map((item) => (
                  <li
                    key={item.id ?? `${category.name}-${item.name}`}
                    className="flex items-start justify-between gap-4 border-b pb-4"
                    style={{ borderColor: `${secondaryColor}66` }}
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="text-sm opacity-75">{item.description}</p>
                      ) : null}
                    </div>
                    <p
                      className="shrink-0 text-sm font-semibold"
                      style={{ color: primaryColor }}
                    >
                      {formatPrice(item.price)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-60">No items in this category yet.</p>
            )}
          </div>
        ))
      )}
    </section>
  );
}
