"use client";

import type { ExtractedCategory, ExtractedMenuItem } from "@/lib/menu-extract";
import {
  resolveMenuBlockDisplay,
  type MenuBlock,
} from "@/lib/site-template";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
      {
        name: "Soup of the day",
        price: 10,
        description: "Ask your server for today’s batch",
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
        description: "Market fish, seasonal garnish",
      },
      {
        name: "Herb roasted chicken",
        price: 24,
        description: "Pan jus, seasonal vegetables",
      },
      {
        name: "Mushroom risotto",
        price: 22,
        description: "Parmesan, thyme, brown butter",
      },
    ],
  },
  {
    name: "Desserts",
    description: "Sample category for preview",
    sort: 2,
    items: [
      {
        name: "Citrus tart",
        price: 11,
        description: "Candied peel, whipped cream",
      },
      {
        name: "Chocolate pot",
        price: 10,
        description: "Dark chocolate, sea salt",
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

function MenuItemRow({
  item,
  primaryColor,
  secondaryColor,
  boldItems,
}: {
  item: ExtractedMenuItem;
  primaryColor: string;
  secondaryColor: string;
  boldItems: boolean;
}) {
  return (
    <li
      className="flex items-start justify-between gap-4 border-b pb-4"
      style={{ borderColor: `${secondaryColor}66` }}
    >
      <div className="min-w-0">
        <p className={cn(boldItems ? "font-bold" : "font-medium")}>
          {item.name}
        </p>
        {item.description ? (
          <p className="text-sm opacity-75">{item.description}</p>
        ) : null}
      </div>
      <p
        className={cn(
          "shrink-0 text-sm",
          boldItems ? "font-bold" : "font-semibold",
        )}
        style={{ color: primaryColor }}
      >
        {formatPrice(item.price)}
      </p>
    </li>
  );
}

function CategoryItems({
  category,
  columns,
  boldItems,
  primaryColor,
  secondaryColor,
}: {
  category: ExtractedCategory;
  columns: 1 | 2;
  boldItems: boolean;
  primaryColor: string;
  secondaryColor: string;
}) {
  if (category.items.length === 0) {
    return (
      <p className="text-sm opacity-60">No items in this category yet.</p>
    );
  }

  return (
    <ul
      className={cn(
        "grid gap-4",
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {category.items.map((item) => (
        <MenuItemRow
          key={item.id ?? `${category.name}-${item.name}`}
          item={item}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          boldItems={boldItems}
        />
      ))}
    </ul>
  );
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
  const { layout, columns, boldItems } = resolveMenuBlockDisplay(block);
  const [activeCategory, setActiveCategory] = useState(
    () => menuCategories[0]?.id ?? menuCategories[0]?.name ?? "",
  );

  const active =
    menuCategories.find(
      (category) => (category.id ?? category.name) === activeCategory,
    ) ?? menuCategories[0];

  return (
    <section
      id="menu"
      className="flex flex-col gap-8 overflow-hidden rounded-[var(--site-radius)] px-6 py-10"
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
      ) : layout === "tabs" ? (
        <div className="flex flex-col gap-6">
          <div
            role="tablist"
            aria-label="Menu categories"
            className="flex flex-wrap gap-2 border-b pb-3"
            style={{ borderColor: `${secondaryColor}66` }}
          >
            {menuCategories.map((category) => {
              const key = category.id ?? category.name;
              const selected =
                (active?.id ?? active?.name) === key;

              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={cn(
                    "rounded-[var(--site-radius)] px-3 py-1.5 text-sm transition-colors",
                    selected ? "font-semibold" : "opacity-70 hover:opacity-100",
                  )}
                  style={
                    selected
                      ? {
                          backgroundColor: `${primaryColor}22`,
                          color: primaryColor,
                        }
                      : undefined
                  }
                  onClick={() => setActiveCategory(key)}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {active ? (
            <div role="tabpanel" className="flex flex-col gap-3">
              {active.description ? (
                <p className="text-sm opacity-75">{active.description}</p>
              ) : null}
              <CategoryItems
                category={active}
                columns={columns}
                boldItems={boldItems}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            </div>
          ) : null}
        </div>
      ) : (
        menuCategories.map((category) => (
          <div
            key={category.id ?? category.name}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <h3
                className={cn(
                  "text-lg tracking-tight",
                  boldItems ? "font-bold" : "font-semibold",
                )}
              >
                {category.name}
              </h3>
              {category.description ? (
                <p className="text-sm opacity-75">{category.description}</p>
              ) : null}
            </div>

            <CategoryItems
              category={category}
              columns={columns}
              boldItems={boldItems}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </div>
        ))
      )}
    </section>
  );
}
