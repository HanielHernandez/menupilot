import { listMediaByRestaurantId } from "@/app/repositories/media.repo";
import MediaGallery from "@/components/MediaGallery";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RestaurantModel } from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function GalleryPage() {
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

  const media = await listMediaByRestaurantId({
    restaurantId: restaurant._id.toString(),
    page: 1,
    pageSize: 100,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <p className="text-muted-foreground text-sm">
          {media.total === 0
            ? "Browse uploaded media for your restaurant."
            : `${media.total} media file${media.total === 1 ? "" : "s"}`}
        </p>
      </div>

      <MediaGallery items={media.items} />
    </div>
  );
}
