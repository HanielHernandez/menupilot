import MenuItemsWidget from "@/components/MenuItemsWidget";
import ResturantDetails from "@/components/ResturantDetails";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/category.model";
import { MediaModel } from "@/models/media.model";
import { MenuItemModel } from "@/models/menu-item.model";
import {
  RestaurantModel as Restaurant,
} from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  await connectDB();

  if (!session) {
    redirect("/auth/signin");
  }

  const restaurant = await Restaurant.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  }).lean();

  if (!restaurant) {
    redirect("/dashboard/onboarding");
  }

  const [menuItems, categories, logoMedia] = await Promise.all([
    MenuItemModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    CategoryModel.find({
      restaurantId: restaurant._id,
      deletedAt: null,
    }).lean(),
    restaurant.logoMediaId
      ? MediaModel.findOne({
          _id: restaurant.logoMediaId,
          deletedAt: null,
        }).lean()
      : Promise.resolve(null),
  ]);

  const categoryNameById = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

  const widgetItems = menuItems.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    categoryName:
      categoryNameById.get(item.categoryId.toString()) ?? "Uncategorized",
  }));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-foreground text-5xl font-bold tracking-tight">
          Hi {session?.user.name}
        </p>
        <p className="text-muted-foreground text-base">
          Welcome to your dashboard
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row h-full lg:max-h-96 justify-center items-start ">
        <ResturantDetails
          restaurant={{
            ...restaurant,
            logoUrl: logoMedia?.url ?? "",
          }}
          className="w-full h-full md:w-1/2 lg:w-1/3"
        />
        <MenuItemsWidget
          items={widgetItems}
          className="w-full md:w-1/2 h-full "
        />
      </div>
      <div className="flex flex-col gap-4 md:flex-row flex-wrap">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">
          Your Restaurant
        </h2>
      </div>
    </div>
  );
}
