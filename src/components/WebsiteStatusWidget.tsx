import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Globe2Icon } from "lucide-react";
import Link from "next/link";

type WebsiteStatusWidgetProps = {
  slug: string;
  publishedAt?: string | Date | null;
  className?: string;
};

function formatPublishedDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function WebsiteStatusWidget({
  slug,
  publishedAt,
  className,
}: WebsiteStatusWidgetProps) {
  const publishedLabel = formatPublishedDate(publishedAt);
  const sitePath = `/site/${slug}`;
  const isPublished = Boolean(publishedLabel);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Website status</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Status
          </p>
          <p className="text-sm font-medium capitalize">
            {isPublished ? "Published" : "Draft"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Last published
          </p>
          <p className="text-sm font-medium">
            {publishedLabel ?? "Not published yet"}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            URL
          </p>
          {isPublished ? (
            <Link
              href={sitePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium break-all underline underline-offset-4"
            >
              {sitePath}
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm break-all">{sitePath}</p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          size="lg"
          className="h-12 w-full text-base"
          nativeButton={false}
          render={<Link href="/dashboard/site" />}
        >
          <Globe2Icon className="size-4" />
          Go to website builder
        </Button>
      </CardFooter>
    </Card>
  );
}
