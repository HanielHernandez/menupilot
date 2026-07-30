"use client";

import { deleteCategoryAction } from "@/app/actions/deleteCategory";
import { saveMenuExtractAction } from "@/app/actions/saveMenuExtract";
import { useMenuExtract } from "@/components/MenuExtractProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ExtractedCategory, ExtractedMenuItem } from "@/lib/menu-extract";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type MenuCategoriesProps = {
  restaurantId: string;
};

type CategoryEditState = {
  originalName: string;
  name: string;
  description: string;
};

type ItemEditState = {
  categoryName: string;
  originalName: string;
  name: string;
  description: string;
  price: string;
};

export default function MenuCategories({ restaurantId }: MenuCategoriesProps) {
  const router = useRouter();
  const {
    categories,
    menuItems,
    updateCategory,
    updateMenuItem,
    moveCategory,
    deleteCategory,
  } = useMenuExtract();
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCategoryName, setDeletingCategoryName] = useState<
    string | null
  >(null);
  const [categoryEdit, setCategoryEdit] = useState<CategoryEditState | null>(
    null,
  );
  const [itemEdit, setItemEdit] = useState<ItemEditState | null>(null);

  const handleSaveAll = async () => {
    if (!categories.length || isSaving) return;

    setIsSaving(true);
    try {
      const result = await saveMenuExtractAction({
        restaurantId,
        categories,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to save menu");
        return;
      }

      router.refresh();
      toast.success(
        `Saved ${result.categoriesSaved} new / ${result.categoriesUpdated} updated categor${
          result.categoriesSaved + result.categoriesUpdated === 1 ? "y" : "ies"
        }, and ${result.itemsSaved} new / ${result.itemsUpdated} updated item${
          result.itemsSaved + result.itemsUpdated === 1 ? "" : "s"
        }.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openCategoryEdit = (category: ExtractedCategory) => {
    setCategoryEdit({
      originalName: category.name,
      name: category.name,
      description: category.description,
    });
  };

  const openItemEdit = (categoryName: string, item: ExtractedMenuItem) => {
    setItemEdit({
      categoryName,
      originalName: item.name,
      name: item.name,
      description: item.description,
      price: String(item.price),
    });
  };

  const saveCategoryEdit = () => {
    if (!categoryEdit?.name.trim()) return;
    updateCategory(categoryEdit.originalName, {
      name: categoryEdit.name,
      description: categoryEdit.description,
    });
    setCategoryEdit(null);
  };

  const saveItemEdit = () => {
    if (!itemEdit?.name.trim()) return;
    updateMenuItem(itemEdit.categoryName, itemEdit.originalName, {
      name: itemEdit.name,
      description: itemEdit.description,
      price: Number(itemEdit.price) || 0,
    });
    setItemEdit(null);
  };

  const handleDeleteCategory = async (category: ExtractedCategory) => {
    if (deletingCategoryName) return;

    const confirmed = window.confirm(
      `Delete category "${category.name}" and its items?`,
    );
    if (!confirmed) return;

    setDeletingCategoryName(category.name);
    try {
      if (category.id) {
        const result = await deleteCategoryAction(category.id, restaurantId);
        if (!result.success) {
          toast.error(result.error || "Failed to delete category");
          return;
        }
      }

      deleteCategory(category.name);
      toast.success(`Deleted "${category.name}"`);
      if (category.id) {
        router.refresh();
      }
    } finally {
      setDeletingCategoryName(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Extracted Menu Content</h2>
          <p className="text-muted-foreground text-sm">
            Review and edit the items detected by our AI before Saving
          </p>
          {menuItems.length > 0 && (
            <p className="text-muted-foreground mt-1 text-xs">
              {menuItems.length} item{menuItems.length === 1 ? "" : "s"} across{" "}
              {categories.length} categor
              {categories.length === 1 ? "y" : "ies"}
            </p>
          )}
        </div>

        <Button
          type="button"
          size="lg"
          disabled={isSaving || categories.length === 0}
          onClick={handleSaveAll}
        >
          {isSaving ? (
            <>
              <Spinner className="size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="size-4" />
              Save all
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <Card key={category.name} className="pt-0">
              <CardHeader className="border-b bg-muted pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-bold text-muted-foreground">
                      {category.name}
                    </CardTitle>
                    {category.description ? (
                      <p className="text-muted-foreground text-sm">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      aria-label={`Move ${category.name} up`}
                      disabled={index === 0}
                      onClick={() => moveCategory(category.name, "up")}
                    >
                      <ChevronUpIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      aria-label={`Move ${category.name} down`}
                      disabled={index === categories.length - 1}
                      onClick={() => moveCategory(category.name, "down")}
                    >
                      <ChevronDownIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      aria-label={`Edit category ${category.name}`}
                      onClick={() => openCategoryEdit(category)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Delete category ${category.name}`}
                      disabled={deletingCategoryName === category.name}
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {category.items.length > 0 ? (
                  category.items.map((item) => (
                    <div
                      key={`${category.name}-${item.name}`}
                      className="flex items-start justify-between gap-3 border-b py-2 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{item.name}</p>
                        {item.description ? (
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-sm font-medium">
                          ${item.price.toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit item ${item.name}`}
                          onClick={() => openItemEdit(category.name, item)}
                        >
                          <PencilIcon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No items in this category
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground">
                No categories found
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">No categories found</CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={categoryEdit !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryEdit(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>
              Update the category name and description.
            </DialogDescription>
          </DialogHeader>

          {categoryEdit && (
            <div className="grid gap-3 py-2">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={categoryEdit.name}
                  onChange={(event) =>
                    setCategoryEdit({
                      ...categoryEdit,
                      name: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  rows={3}
                  value={categoryEdit.description}
                  onChange={(event) =>
                    setCategoryEdit({
                      ...categoryEdit,
                      description: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryEdit(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveCategoryEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={itemEdit !== null}
        onOpenChange={(open) => {
          if (!open) setItemEdit(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
            <DialogDescription>
              Update this item&apos;s name, price, and description.
            </DialogDescription>
          </DialogHeader>

          {itemEdit && (
            <div className="grid gap-3 py-2">
              <Field>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={itemEdit.name}
                  onChange={(event) =>
                    setItemEdit({
                      ...itemEdit,
                      name: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Price</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemEdit.price}
                  onChange={(event) =>
                    setItemEdit({
                      ...itemEdit,
                      price: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  rows={3}
                  value={itemEdit.description}
                  onChange={(event) =>
                    setItemEdit({
                      ...itemEdit,
                      description: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemEdit(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveItemEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
