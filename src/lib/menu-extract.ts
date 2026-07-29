export type ExtractedMenuItem = {
  id?: string;
  name: string;
  price: number;
  description: string;
};

export type ExtractedCategory = {
  id?: string;
  name: string;
  description: string;
  sort: number;
  items: ExtractedMenuItem[];
};

export type ExtractedMenu = {
  categories: ExtractedCategory[];
};

export function createEmptyExtractedMenu(): ExtractedMenu {
  return { categories: [] };
}

export function withCategorySort(
  categories: ExtractedCategory[],
): ExtractedCategory[] {
  return categories.map((category, index) => ({
    ...category,
    sort: index,
  }));
}

export function flattenMenuItems(menu: ExtractedMenu) {
  return menu.categories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryName: category.name,
    })),
  );
}

export type FlatMenuItem = ReturnType<typeof flattenMenuItems>[number];

export function mergeExtractedMenus(
  base: ExtractedMenu,
  incoming: ExtractedMenu,
): ExtractedMenu {
  const categories = [...base.categories];

  for (const category of incoming.categories) {
    const existing = categories.find(
      (item) => item.name.toLowerCase() === category.name.toLowerCase(),
    );

    if (!existing) {
      categories.push({
        name: category.name,
        description: category.description ?? "",
        sort: categories.length,
        items: category.items.map((item) => ({
          name: item.name,
          price: Number(item.price) || 0,
          description: item.description ?? "",
        })),
      });
      continue;
    }

    for (const item of category.items) {
      const alreadyExists = existing.items.some(
        (current) => current.name.toLowerCase() === item.name.toLowerCase(),
      );
      if (alreadyExists) continue;

      existing.items.push({
        name: item.name,
        price: Number(item.price) || 0,
        description: item.description ?? "",
      });
    }
  }

  return { categories: withCategorySort(categories) };
}

export function parseExtractedMenu(raw: string): ExtractedMenu {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(cleaned) as {
    categories?: Array<{
      name?: string;
      description?: string;
      items?: Array<{
        name?: string;
        price?: number | string;
        description?: string;
      }>;
    }>;
  };

  const categories = (parsed.categories ?? [])
    .filter((category) => category?.name)
    .map((category, index) => ({
      name: String(category.name).trim(),
      description: String(category.description ?? "").trim(),
      sort: index,
      items: (category.items ?? [])
        .filter((item) => item?.name)
        .map((item) => ({
          name: String(item.name).trim(),
          price: Number(item.price) || 0,
          description: String(item.description ?? "").trim(),
        })),
    }));

  return { categories };
}

export function moveCategory(
  categories: ExtractedCategory[],
  categoryName: string,
  direction: "up" | "down",
): ExtractedCategory[] {
  const index = categories.findIndex(
    (category) => category.name === categoryName,
  );
  if (index < 0) return categories;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= categories.length) {
    return categories;
  }

  const next = [...categories];
  const [category] = next.splice(index, 1);
  next.splice(targetIndex, 0, category);
  return withCategorySort(next);
}
