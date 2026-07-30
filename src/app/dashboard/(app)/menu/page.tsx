import MenuWorkspace from "@/components/MenuWorkspace";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { flattenMenuItems, type ExtractedCategory } from "@/lib/menu-extract";
import { CategoryModel } from "@/models/category.model";
import { MediaModel } from "@/models/media.model";
import { MenuImageModel } from "@/models/menu-image.model";
import { MenuItemModel } from "@/models/menu-item.model";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";

export default async function MenuPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  }).lean();

  if (!restaurant) {
    return null;
  }

  const [menuImages, categories, menuItems] = await Promise.all([
    MenuImageModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    }).lean(),
    CategoryModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .sort({ sort: 1, name: 1 })
      .lean(),
    MenuItemModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .sort({ name: 1 })
      .lean(),
  ]);

  const mediaIds = menuImages
    .map((item) => item.mediaId)
    .filter(Boolean);

  const mediaDocs = mediaIds.length
    ? await MediaModel.find({
        _id: { $in: mediaIds },
        deletedAt: null,
      }).lean()
    : [];

  const mediaById = new Map(
    mediaDocs.map((doc) => [doc._id.toString(), doc]),
  );

  const initialCategories: ExtractedCategory[] = categories.map(
    (category, index) => ({
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
    }),
  );

  const initialMenuItems = flattenMenuItems({ categories: initialCategories });
  const menuVersion = [
    restaurant._id.toString(),
    categories.length,
    menuItems.length,
    categories.map((category) => category.updatedAt?.toString?.() ?? "").join("-"),
    menuItems.map((item) => item.updatedAt?.toString?.() ?? "").join("-"),
  ].join(":");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Menu</h2>
        <p className="text-muted-foreground text-sm">
          Manage menu uploads, extracted content, and image files for{" "}
          {restaurant.name}
        </p>
      </div>

      <MenuWorkspace
        key={menuVersion}
        restaurantId={restaurant._id.toString()}
        menuImages={menuImages
          .map((item) => {
            const media = mediaById.get(item.mediaId?.toString() ?? "");
            if (!media?.url) return null;
            return {
              _id: item._id.toString(),
              mediaId: item.mediaId.toString(),
              url: media.url,
              status: item.status,
              fileName: media.name || media.key.split("/").pop() || "menu-image",
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)}
        initialCategories={initialCategories}
        initialMenuItems={initialMenuItems}
      />
    </div>
  );
}
