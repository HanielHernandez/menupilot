"use client";

import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { redirect } from "next/navigation";

type DashBoardPageProps = {
  children: React.ReactNode;
};
export default function DashboardPage({ children }: DashBoardPageProps) {
  const { data: session, isPending } = authClient.useSession();

  if (!session && !isPending) {
    redirect("/signin");
  }

  const user = session?.user as User;

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <p>Welcome {user.name}</p>
      {children}
    </div>
  );
}
