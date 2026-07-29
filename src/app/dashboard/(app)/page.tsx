import ResturantDetails from "@/components/ResturantDetails";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  RestaurantModel as Restaurant,
  Restaurant as RestaurantI,
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

  const restaurant = await Restaurant.findOne<RestaurantI>({
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="flex flex-col gap-8 mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-2">
        <p className="text-5xl font-bold tracking-tight text-foreground">
          Hi {session?.user.name}
        </p>
        <p className="text-muted-foreground text-base">
          Welcome to your dashboard
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
        <ResturantDetails
          restaurant={restaurant}
          className="w-full md:w-1/2 lg:w-1/3"
        />
      </div>
    </div>
  );
}
