import AppSidebar from "@/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { RestaurantModel as Restaurant } from "@/models/restaurant.model";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Parent layout already requires a session; this satisfies typing.
  if (!session) {
    redirect("/auth/signin");
  }

  await connectDB();

  const restaurant = await Restaurant.findOne({
    ownerId: session.user.id,
    deletedAt: null,
  });

  if (!restaurant) {
    redirect("/dashboard/onboarding");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={session.user} />
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <h1 className="font-semibold">Dashboard</h1>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
