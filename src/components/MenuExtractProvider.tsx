"use client";

import {
  flattenMenuItems,
  moveCategory as moveCategoryOrder,
  withCategorySort,
  type ExtractedCategory,
  type ExtractedMenu,
  type ExtractedMenuItem,
  type FlatMenuItem,
} from "@/lib/menu-extract";
import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

type MenuExtractContextValue = {
  categories: ExtractedCategory[];
  menuItems: FlatMenuItem[];
  setExtractedMenu: (menu: ExtractedMenu) => void;
  clearExtractedMenu: () => void;
  updateCategory: (
    categoryName: string,
    next: Pick<ExtractedCategory, "name" | "description">,
  ) => void;
  updateMenuItem: (
    categoryName: string,
    itemName: string,
    next: ExtractedMenuItem,
  ) => void;
  moveCategory: (categoryName: string, direction: "up" | "down") => void;
};

const MenuExtractContext = createContext<MenuExtractContextValue | null>(null);

type MenuExtractProviderProps = {
  children: ReactNode;
  initialCategories?: ExtractedCategory[];
  initialMenuItems?: FlatMenuItem[];
};

export function MenuExtractProvider({
  children,
  initialCategories = [],
  initialMenuItems = [],
}: MenuExtractProviderProps) {
  const [categories, setCategories] = useState<ExtractedCategory[]>(() =>
    withCategorySort(initialCategories),
  );
  const [menuItems, setMenuItems] = useState<FlatMenuItem[]>(initialMenuItems);

  const syncMenu = (nextCategories: ExtractedCategory[]) => {
    const sorted = withCategorySort(nextCategories);
    setCategories(sorted);
    setMenuItems(flattenMenuItems({ categories: sorted }));
  };

  const value = useMemo<MenuExtractContextValue>(
    () => ({
      categories,
      menuItems,
      setExtractedMenu: (menu) => {
        syncMenu(menu.categories);
      },
      clearExtractedMenu: () => {
        setCategories([]);
        setMenuItems([]);
      },
      updateCategory: (categoryName, next) => {
        const trimmedName = next.name.trim();
        if (!trimmedName) return;

        syncMenu(
          categories.map((category) => {
            if (category.name !== categoryName) return category;
            return {
              ...category,
              id: category.id,
              name: trimmedName,
              description: next.description.trim(),
            };
          }),
        );
      },
      updateMenuItem: (categoryName, itemName, next) => {
        const trimmedName = next.name.trim();
        if (!trimmedName) return;

        syncMenu(
          categories.map((category) => {
            if (category.name !== categoryName) return category;
            return {
              ...category,
              items: category.items.map((item) => {
                if (item.name !== itemName) return item;
                return {
                  id: item.id,
                  name: trimmedName,
                  description: next.description.trim(),
                  price: Number(next.price) || 0,
                };
              }),
            };
          }),
        );
      },
      moveCategory: (categoryName, direction) => {
        syncMenu(moveCategoryOrder(categories, categoryName, direction));
      },
    }),
    [categories, menuItems],
  );

  return createElement(MenuExtractContext.Provider, { value }, children);
}

export function useMenuExtract() {
  const context = useContext(MenuExtractContext);
  if (!context) {
    throw new Error(
      "useMenuExtract must be used within a MenuExtractProvider",
    );
  }
  return context;
}

export function withMenuExtract<P extends object>(
  Component: ComponentType<P>,
  providerProps?: Omit<MenuExtractProviderProps, "children">,
) {
  function WithMenuExtract(props: P) {
    return (
      <MenuExtractProvider {...providerProps}>
        <Component {...props} />
      </MenuExtractProvider>
    );
  }

  WithMenuExtract.displayName = `withMenuExtract(${
    Component.displayName || Component.name || "Component"
  })`;

  return WithMenuExtract;
}
