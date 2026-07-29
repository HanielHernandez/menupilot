import OnboardingWizard from "@/components/OnboardingWizard";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  RestaurantModel as Restaurant,
  Restaurant as RestaurantI,
} from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  await connectDB();

  const restaurant = await Restaurant.findOne<RestaurantI>({
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (restaurant) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center gap-2 text-center w-full max-w-5xl">
        <h1 className="text-2xl font-bold">Set up your restaurant</h1>
        <OnboardingWizard />
      </div>
    </div>
  );
}
