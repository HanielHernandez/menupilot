import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export type MenuItemsWidgetItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryName: string;
};

type MenuItemsWidgetProps = {
  items: MenuItemsWidgetItem[];
  className?: string;
};

export default function MenuItemsWidget({
  items,
  className,
}: MenuItemsWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Menu items</CardTitle>
          <p className="text-muted-foreground text-sm">
            Latest items from your restaurant menu
          </p>
        </div>
        <Button size="sm" render={<Link href="/dashboard/menu" />}>
          See full menu
        </Button>
      </CardHeader>

      <CardContent>
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="text-muted-foreground truncate text-xs">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-sm">
            No menu items yet. Upload and extract a menu to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
