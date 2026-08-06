import RestaurantEditForm from "@/components/RestaurantEditForm";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { mapRestaurantSchedule } from "@/lib/restaurant-schedule";
import { MediaModel } from "@/models/media.model";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RestaurantPage() {
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

  const logoMediaId = restaurant.logoMediaId?.toString() ?? "";
  const logoMedia = logoMediaId
    ? await MediaModel.findOne({
        _id: logoMediaId,
        deletedAt: null,
      }).lean()
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">My restaurant</h2>
        <p className="text-muted-foreground text-sm">
          Edit profile details for {restaurant.name}
        </p>
      </div>

      <RestaurantEditForm
        initialValues={{
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description ?? "",
          logoMediaId,
          logoUrl: logoMedia?.url ?? "",
          address: restaurant.address ?? "",
          email: restaurant.email ?? "",
          phoneNumber: restaurant.phoneNumber ?? "",
          whatsappNumber: restaurant.whatsappNumber ?? "",
          schedule: mapRestaurantSchedule(restaurant.schedule),
          socials: {
            instagram: restaurant.socials?.instagram ?? "",
            tiktok: restaurant.socials?.tiktok ?? "",
            facebook: restaurant.socials?.facebook ?? "",
            x: restaurant.socials?.x ?? "",
            youtube: restaurant.socials?.youtube ?? "",
            website: restaurant.socials?.website ?? "",
          },
        }}
      />
    </div>
  );
}
