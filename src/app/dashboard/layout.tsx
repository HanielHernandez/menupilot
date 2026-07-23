import AppSidebar from "@/components/sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar user={session.user} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
            <SidebarTrigger />
            <h1 className="font-semibold">Dashboard</h1>
          </header>
          <div className="flex flex-1 flex-col p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
