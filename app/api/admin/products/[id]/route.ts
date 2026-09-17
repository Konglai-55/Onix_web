import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/products";
import {
  deleteProductImage,
  getProductImageKey,
  isSupportedProductImageType,
  MAX_PRODUCT_IMAGE_BYTES,
  uploadProductImage,
} from "@/lib/rains3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, context: ProductRouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ message: "请先登录后台。" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ message: "商品不存在。" }, { status: 404 });
  }

  const imageKey = product.imageKey ?? getProductImageKey(product.imageUrl);

  try {
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ message: "商品不存在。" }, { status: 404 });
    }

    if (imageKey) {
      await deleteProductImage(imageKey).catch((error) => {
        console.error("Failed to clean up deleted product image", error);
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "删除商品失败。" },
      { status: 500 }
    );
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: ProductRouteContext) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ message: "请先登录后台。" }, { status: 401 });
  }

  const { id } = await context.params;
  const currentProduct = await getProductById(id);

  if (!currentProduct) {
    return NextResponse.json({ message: "商品不存在。" }, { status: 404 });
  }

  let uploadedImageKey: string | undefined;

  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const featured = formData.has("featured")
      ? String(formData.get("featured") ?? "") === "true"
      : currentProduct.featured;
    const file = formData.get("image");

    if (!name || !description) {
      return NextResponse.json(
        { message: "请填写产品名和简介。" },
        { status: 400 }
      );
    }

    let imageUpdate: { imageKey: string; imageUrl: string } | undefined;

    if (file instanceof File && file.size > 0) {
      if (!isSupportedProductImageType(file.type)) {
        return NextResponse.json(
          { message: "只能上传图片文件。" },
          { status: 400 }
        );
      }

      if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
        return NextResponse.json(
          { message: "商品图片不能超过 10MB。" },
          { status: 400 }
        );
      }

      const uploadedImage = await uploadProductImage(file);
      uploadedImageKey = uploadedImage.key;
      imageUpdate = {
        imageUrl: uploadedImage.url,
        imageKey: uploadedImage.key,
      };
    }

    const product = await updateProduct(id, {
      name,
      category,
      description,
      featured,
      ...imageUpdate,
    });

    if (!product) {
      if (uploadedImageKey) {
        await deleteProductImage(uploadedImageKey);
        uploadedImageKey = undefined;
      }
      return NextResponse.json({ message: "商品不存在。" }, { status: 404 });
    }
    uploadedImageKey = undefined;

    const oldImageKey =
      currentProduct.imageKey ?? getProductImageKey(currentProduct.imageUrl);

    if (imageUpdate && oldImageKey && oldImageKey !== imageUpdate.imageKey) {
      await deleteProductImage(oldImageKey).catch((error) => {
        console.error("Failed to clean up replaced product image", error);
      });
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json({ product });
  } catch (error) {
    if (uploadedImageKey) {
      await deleteProductImage(uploadedImageKey).catch(() => undefined);
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "更新商品失败。" },
      { status: 500 }
    );
  }
}
