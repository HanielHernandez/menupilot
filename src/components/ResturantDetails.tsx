import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Restaurant } from "@/models/restaurant.model";
import { Edit } from "lucide-react";
interface ResturantDetailsProps {
  restaurant: Restaurant;
  className?: string;
}

export default function ResturantDetails({
  restaurant,
  className,
}: ResturantDetailsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center text-2xl text-foreground font-bold leading-normal tracking-normal">
          {restaurant.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-base leading-normal tracking-normal text-center">
          {restaurant.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">
          <Edit size={20} />
        </Button>
      </CardFooter>
    </Card>
  );
}
