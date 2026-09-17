import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { verifyAdminRequest } from "@/lib/admin-auth";
import { createProduct, getProducts } from "@/lib/products";
import {
  deleteProductImage,
  isSupportedProductImageType,
  MAX_PRODUCT_IMAGE_BYTES,
  uploadProductImage,
} from "@/lib/rains3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ message: "请先登录后台。" }, { status: 401 });
  }
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const wantsHtml = wantsHtmlResponse(request);
  let uploadedImageKey: string | undefined;

  if (!verifyAdminRequest(request)) {
    return errorResponse(request, wantsHtml, "请先登录后台。", 401);
  }

  try {
    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const featured = String(formData.get("featured") ?? "") === "true";
    const file = formData.get("image");

    if (!name || !description) {
      return errorResponse(request, wantsHtml, "请填写产品名和简介。", 400);
    }

    if (!(file instanceof File) || file.size <= 0) {
      return errorResponse(request, wantsHtml, "请上传商品图片。", 400);
    }

    if (!isSupportedProductImageType(file.type)) {
      return errorResponse(request, wantsHtml, "只能上传图片文件。", 400);
    }

    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      return errorResponse(request, wantsHtml, "商品图片不能超过 10MB。", 400);
    }

    const uploadedImage = await uploadProductImage(file);
    uploadedImageKey = uploadedImage.key;

    const product = await createProduct({
      name,
      category,
      description,
      imageUrl: uploadedImage.url,
      imageKey: uploadedImage.key,
      featured,
    });
    uploadedImageKey = undefined;

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    if (wantsHtml) {
      return redirectToAdmin(request, { uploaded: "1" });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (uploadedImageKey) {
      await deleteProductImage(uploadedImageKey).catch(() => undefined);
    }

    return errorResponse(
      request,
      wantsHtml,
      error instanceof Error ? error.message : "保存商品失败。",
      500
    );
  }
}

function wantsHtmlResponse(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

function errorResponse(
  request: Request,
  wantsHtml: boolean,
  message: string,
  status: number
) {
  if (wantsHtml) {
    return redirectToAdmin(request, { uploadError: message });
  }

  return NextResponse.json({ message }, { status });
}

function redirectToAdmin(request: Request, params: Record<string, string>) {
  const url = new URL("/admin/products", request.url);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return NextResponse.redirect(url, { status: 303 });
}
