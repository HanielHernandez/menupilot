"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { User } from "better-auth";
import {
  ChevronsUpDownIcon,
  Globe2Icon,
  LayoutDashboardIcon,
  LogOutIcon,
  TagsIcon,
  UtensilsIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Menu",
    href: "/dashboard/menu",
    icon: UtensilsIcon,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: TagsIcon,
  },
  {
    title: "Site",
    href: "/dashboard/site",
    icon: Globe2Icon,
  },
];

export default function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/auth/signin");
    router.refresh();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="MenuPilot"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <UtensilsIcon />
              </div>
              <span className="font-semibold">MenuPilot</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      item.href === "/dashboard"
                        ? pathname === item.href
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" />}
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={avatarUrl}
                    alt={`${user.name}'s avatar`}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                className="w-56"
              >
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}