"use server";

import { findRestaurantBySlug } from "@/app/repositories/restaurant.repo";
import { sendTableRequestEmail } from "@/lib/email";
import * as z from "zod";

const tableRequestSchema = z.object({
  restaurantSlug: z.string().trim().min(1),
  name: z.string().trim().min(1, { message: "Name is required" }),
  email: z.email({ message: "Enter a valid email address" }),
  message: z
    .string()
    .trim()
    .min(1, { message: "Please include date, time, and party size" }),
});

export type SubmitTableRequestInput = z.infer<typeof tableRequestSchema>;

export type SubmitTableRequestResult =
  | { success: true }
  | { success: false; error: string };

/** Sends a public site table request to the restaurant contact email. */
export async function submitTableRequestAction(
  input: SubmitTableRequestInput,
): Promise<SubmitTableRequestResult> {
  const parsed = tableRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid request details",
    };
  }

  const restaurant = await findRestaurantBySlug(
    parsed.data.restaurantSlug.toLowerCase(),
  );

  if (!restaurant) {
    return { success: false, error: "Restaurant not found" };
  }

  const restaurantEmail = restaurant.email?.trim();
  if (!restaurantEmail) {
    return {
      success: false,
      error:
        "This restaurant is not accepting table requests by email yet. Please contact them another way.",
    };
  }

  try {
    await sendTableRequestEmail({
      to: restaurantEmail,
      restaurantName: restaurant.name,
      guestName: parsed.data.name,
      guestEmail: parsed.data.email,
      message: parsed.data.message,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send table request email", error);
    return {
      success: false,
      error: "Could not send your request. Please try again.",
    };
  }
}
