"use server";

import {
  publishSiteDraft,
  saveSiteDraft,
  type SitePublishStatus,
} from "@/app/repositories/site.repo";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  siteContentSchema,
  type SaveSiteFormInput,
} from "@/lib/site-content-schema";
import { RestaurantModel } from "@/models/restaurant.model";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type PublishSiteResult =
  | { success: true; status: SitePublishStatus }
  | { success: false; error: string };

export async function publishSiteAction(
  input: SaveSiteFormInput,
): Promise<PublishSiteResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "You must be signed in" };
  }

  const parsed = siteContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid site details",
    };
  }

  await connectDB();

  const restaurant = await RestaurantModel.findOne({
    _id: parsed.data.restaurantId,
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const restaurantId = restaurant._id.toString();

  try {
    await saveSiteDraft({
      restaurantId,
      templateId: parsed.data.templateId,
      settings: parsed.data.settings,
      media: parsed.data.media,
      blocks: parsed.data.blocks as Parameters<typeof saveSiteDraft>[0]["blocks"],
    });

    const { status } = await publishSiteDraft(restaurantId);

    revalidatePath("/dashboard/site");
    revalidatePath(`/site/${restaurant.slug}`);
    return { success: true, status };
  } catch (error) {
    console.error("Failed to publish site", error);
    return {
      success: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Could not publish site. Please try again.",
    };
  }
}
