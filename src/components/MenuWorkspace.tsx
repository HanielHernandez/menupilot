"use client";

import ImageUploader from "@/components/ImageUploader";
import MenuCategories from "@/components/MenuCategories";
import { MenuExtractProvider } from "@/components/MenuExtractProvider";
import MenuImagesList, {
  type MenuImageListItem,
} from "@/components/MenuImagesList";
import ProcessImagesButton from "@/components/ProcessImagesButton";
import type { ExtractedCategory, FlatMenuItem } from "@/lib/menu-extract";

type MenuWorkspaceProps = {
  restaurantId: string;
  menuImages: MenuImageListItem[];
  initialCategories?: ExtractedCategory[];
  initialMenuItems?: FlatMenuItem[];
};

function MenuWorkspaceInner({
  restaurantId,
  menuImages,
}: {
  restaurantId: string;
  menuImages: MenuImageListItem[];
}) {
  const uploadedImageIds = menuImages
    .filter((image) => image.status === "uploaded")
    .map((image) => image._id);

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row">
      <div className="flex w-full flex-col gap-2 lg:w-1/3">
        <h3 className="text-lg font-bold">Source documents</h3>
        <p className="text-muted-foreground text-sm">
          Upload your menu files for AI Extraction
        </p>
        <ImageUploader />

        <div className="bg-card mt-4 rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold">Uploaded menu images</h4>
              <p className="text-muted-foreground text-sm">
                {menuImages.length} image{menuImages.length === 1 ? "" : "s"}{" "}
                available
              </p>
            </div>
            <ProcessImagesButton
              restaurantId={restaurantId}
              imageIds={uploadedImageIds}
              disabled={uploadedImageIds.length === 0}
            />
          </div>
          <MenuImagesList items={menuImages} />
        </div>
      </div>

      <div className="flex w-full flex-col lg:w-2/3">
        <MenuCategories restaurantId={restaurantId} />
      </div>
    </div>
  );
}

export default function MenuWorkspace({
  restaurantId,
  menuImages,
  initialCategories = [],
  initialMenuItems = [],
}: MenuWorkspaceProps) {
  return (
    <MenuExtractProvider
      initialCategories={initialCategories}
      initialMenuItems={initialMenuItems}
    >
      <MenuWorkspaceInner
        restaurantId={restaurantId}
        menuImages={menuImages}
      />
    </MenuExtractProvider>
  );
}
