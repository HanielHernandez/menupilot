import { getOrCreateSiteForRestaurant } from "@/app/repositories/site.repo";
import SiteBuilder from "@/components/SiteBuilder";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SitePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  }).lean();

  if (!restaurant) {
    redirect("/dashboard/onboarding");
  }

  const site = await getOrCreateSiteForRestaurant(restaurant._id.toString());

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Site</h2>
        <p className="text-muted-foreground text-sm">
          Customize colors, typography, and media for {restaurant.name}
        </p>
      </div>

      <SiteBuilder
        restaurant={{
          id: restaurant._id.toString(),
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description ?? "",
          logoImage: restaurant.logoImage ?? "",
          address: restaurant.address ?? "",
          phoneNumber: restaurant.phoneNumber ?? "",
          whatsappNumber: restaurant.whatsappNumber ?? "",
          socials: {
            facebook: restaurant.socials?.facebook ?? "",
            instagram: restaurant.socials?.instagram ?? "",
            tiktok: restaurant.socials?.tiktok ?? "",
            x: restaurant.socials?.x ?? "",
            youtube: restaurant.socials?.youtube ?? "",
            website: restaurant.socials?.website ?? "",
          },
        }}
        initialValues={{
          templateId: site.templateId,
          settings: site.settings,
          media: site.media ?? [],
          blocks: site.blocks ?? [],
        }}
      />
    </div>
  );
}
