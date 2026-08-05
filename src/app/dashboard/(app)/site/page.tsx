import { getOrCreateSiteDraftForRestaurant } from "@/app/repositories/site.repo";
import SiteBuilder from "@/components/SiteBuilder";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { MediaModel } from "@/models/media.model";
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

  const { draft, status } = await getOrCreateSiteDraftForRestaurant(
    restaurant._id.toString(),
  );
  const logoMediaId = restaurant.logoMediaId?.toString() ?? null;
  const logoMedia = logoMediaId
    ? await MediaModel.findOne({
        _id: logoMediaId,
        deletedAt: null,
      }).lean()
    : null;

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <SiteBuilder
        restaurant={{
          id: restaurant._id.toString(),
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description ?? "",
          logoMediaId,
          logoUrl: logoMedia?.url ?? "",
          address: restaurant.address ?? "",
          email: restaurant.email ?? "",
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
          templateId: draft.templateId,
          settings: draft.settings,
          media: draft.media ?? [],
          blocks: draft.blocks ?? [],
        }}
        initialStatus={status}
      />
    </div>
  );
}
