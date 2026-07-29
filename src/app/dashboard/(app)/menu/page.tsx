import ImageUploader from "@/components/ImageUploader";
import MenuImagesList from "@/components/MenuImagesList";
import ProcessImagesButton from "@/components/ProcessImagesButton";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/category.model";
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

  const [menuItems, menuImages, categories] = await Promise.all([
    MenuItemModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .lean()
      .then((items) => items ?? []),
    MenuImageModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .lean()
      .then((items) => items ?? []),
    CategoryModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .lean()
      .then((items) => items ?? []),
  ]);

  return (
    <div className="flex w-full max-w-7xl flex-col gap-6 mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Menu</h2>
        <p className="text-sm text-muted-foreground">
          Manage menu uploads, extracted content, and image files for{" "}
          {restaurant.name}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex w-1/3 flex-col gap-2">
          <h3 className="text-lg font-bold">Source documents</h3>
          <p className="text-sm text-muted-foreground">
            Upload your menu files for AI Extraction
          </p>
          <ImageUploader />

          <div className="mt-4 rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h4 className="font-semibold">Uploaded menu images</h4>
                <p className="text-sm text-muted-foreground">
                  {menuImages.length} image{menuImages.length === 1 ? "" : "s"}{" "}
                  available
                </p>
              </div>
              <ProcessImagesButton
                disabled={
                  !menuImages.some((image) => image.status === "uploaded")
                }
              />
            </div>
            <MenuImagesList
              items={menuImages.map((item) => ({
                _id: item._id.toString(),
                url: item.url,
                status: item.status,
                fileName: item.key?.split("/").pop() ?? item.url.split("/").pop(),
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
