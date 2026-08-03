import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Restaurant } from "@/models/restaurant.model";
import { Edit, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";

interface ResturantDetailsProps {
  restaurant: Restaurant & { logoUrl?: string; slug: string };
  className?: string;
  isPublished?: boolean;
}

export default function ResturantDetails({
  restaurant,
  className,
  isPublished = false,
}: ResturantDetailsProps) {
  const logo = restaurant.logoUrl?.trim();
  const avatarUrl =
    logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&size=128&background=random`;
  const initials = restaurant.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={className}>
      <CardHeader className="items-center flex-col gap-4 flex justify-center">
        <Avatar className="size-32 rounded-full">
          <AvatarImage src={avatarUrl} alt={restaurant.name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <CardTitle className="text-center text-2xl font-bold leading-normal tracking-normal text-foreground">
          {restaurant.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="flex h-full flex-col gap-2">
          <p className="text-center text-base leading-normal tracking-normal text-muted-foreground">
            {restaurant.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isPublished && restaurant.slug ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/site/${restaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon className="size-4" />
            View site
          </Button>
        ) : null}
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard/restaurant" />}
        >
          <Edit size={20} />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
