import { connectDB } from "@/lib/db";
import type { ExtractedCategory } from "@/lib/menu-extract";
import { CategoryModel } from "@/models/category.model";
import { MenuItemModel } from "@/models/menu-item.model";

/** Categories with items for the public site menu block. */
export async function findMenuForRestaurant(
  restaurantId: string,
): Promise<ExtractedCategory[]> {
  await connectDB();

  const [categories, menuItems] = await Promise.all([
    CategoryModel.find({
      restaurantId,
      deletedAt: null,
    })
      .sort({ sort: 1, name: 1 })
      .lean(),
    MenuItemModel.find({
      restaurantId,
      deletedAt: null,
    })
      .sort({ name: 1 })
      .lean(),
  ]);

  return categories.map((category, index) => ({
    id: category._id.toString(),
    name: category.name,
    description: category.description ?? "",
    sort: category.sort ?? index,
    items: menuItems
      .filter(
        (item) => item.categoryId.toString() === category._id.toString(),
      )
      .map((item) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description ?? "",
        price: item.price,
      })),
  }));
}
