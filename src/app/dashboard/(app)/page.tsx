import { findPublishedSiteByRestaurantId } from "@/app/repositories/site.repo";
import MenuItemsWidget from "@/components/MenuItemsWidget";
import ResturantDetails from "@/components/ResturantDetails";
import WebsiteStatusWidget from "@/components/WebsiteStatusWidget";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CategoryModel } from "@/models/category.model";
import { MediaModel } from "@/models/media.model";
import { MenuItemModel } from "@/models/menu-item.model";
import { RestaurantModel as Restaurant } from "@/models/restaurant.model";
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

  const [menuItems, categories, logoMedia, publishedSite] = await Promise.all([
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
    findPublishedSiteByRestaurantId(restaurant._id.toString()),
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

      <div className="flex h-full flex-col w-full gap-4 lg:flex-row lg:items-stretch lg:max-h-96">
        <ResturantDetails
          restaurant={{
            ...restaurant,
            slug: restaurant.slug,
            logoUrl: logoMedia?.url ?? "",
          }}
          isPublished={Boolean(publishedSite?.publishedAt)}
          className="h-full w-full lg:w-1/3"
        />
        <MenuItemsWidget
          items={widgetItems}
          className="h-full w-full lg:w-2/3"
        />
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <WebsiteStatusWidget
          slug={restaurant.slug}
          publishedAt={publishedSite?.publishedAt ?? null}
          className="h-full w-full lg:w-1/3"
        />
      </div>
    </div>
  );
}
