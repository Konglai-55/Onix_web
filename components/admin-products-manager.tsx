"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Trash2, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/products";

type AdminProductsManagerProps = {
  initialProducts: Product[];
  initialNotice?: Notice | null;
};

type Notice = {
  type: "success" | "error";
  message: string;
};

export function AdminProductsManager({
  initialProducts,
  initialNotice = null,
}: AdminProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(initialNotice);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const setFieldValue = (name: string, value: string) => {
      const field = form.elements.namedItem(name);

      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        field.value = value;
      }
    };

    setFieldValue("name", editingProduct?.name ?? "");
    setFieldValue("category", editingProduct?.category ?? "");
    setFieldValue("description", editingProduct?.description ?? "");
    setIsFeatured(editingProduct?.featured ?? false);

    const imageField = form.elements.namedItem("image");
    if (imageField instanceof HTMLInputElement) {
      imageField.value = "";
    }
  }, [editingProduct]);

  function showError(message: string) {
    setNotice({ type: "error", message });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const file = formData.get("image");

    if (!name || !description) {
      showError("请填写产品名和简介。");
      return;
    }

    if (!editingProduct && (!(file instanceof File) || file.size <= 0)) {
      showError("请先选择一张商品图片。");
      return;
    }

    if (file instanceof File && file.size > 0) {
      if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) {
        showError("仅支持 JPG、PNG、WEBP、GIF 或 AVIF 图片。");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError("商品图片不能超过 10MB。");
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        editingProduct
          ? `/api/admin/products/${editingProduct.id}`
          : "/api/admin/products",
        {
          method: editingProduct ? "PATCH" : "POST",
          body: formData,
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "保存失败。");
      }

      setProducts((currentProducts) =>
        editingProduct
          ? currentProducts.map((product) =>
              product.id === payload.product.id ? payload.product : product
            )
          : [payload.product, ...currentProducts]
      );
      formRef.current?.reset();
      setEditingProduct(null);
      setIsFeatured(false);
      setNotice({
        type: "success",
        message: editingProduct
          ? "商品修改已保存，前台展示内容已更新。"
          : "商品已保存，已写入后台列表；如果前台页面已经打开，请刷新后查看。",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "保存失败。",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
    setNotice(null);
  }

  function cancelEditing() {
    setEditingProduct(null);
    setNotice(null);
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`确定删除「${product.name}」吗？`);

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "删除失败。");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id)
      );
      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
      }
      setNotice({ type: "success", message: "商品已删除。" });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "删除失败。",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,0.58fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{editingProduct ? "编辑商品" : "上传商品"}</CardTitle>
          <CardDescription>
            {editingProduct
              ? "修改商品资料；如需更换图片，再从本地选择新图片。"
              : "从本地选择图片上传，后台保存到存储空间后提供给前台展示。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            action="/api/admin/products"
            method="post"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset disabled={isSaving || deletingId !== null} className="min-w-0">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">产品名</FieldLabel>
                <Input id="name" name="name" placeholder="例如：LED 硬壳背包" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="category">产品系列</FieldLabel>
                <Input id="category" name="category" placeholder="例如：Smart Series" />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">简介</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="填写产品材质、特点、适用场景等"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="image">上传图片</FieldLabel>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  required={!editingProduct}
                />
                <FieldDescription>
                  {editingProduct
                    ? "不选择新图片则继续使用当前图片；单张图片不能超过 10MB。"
                    : "图片会上传到 RainS3 存储；网站展示时直接读取存储返回的 DNS 地址，单张图片不能超过 10MB。"}
                </FieldDescription>
              </Field>

              <Field orientation="horizontal" className="items-start gap-3">
                <Checkbox
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                />
                <div className="flex flex-col gap-1">
                  <FieldLabel htmlFor="featured">设为首页精选</FieldLabel>
                  <FieldDescription>
                    首页最多展示 6 个精选商品。
                  </FieldDescription>
                </div>
                <input
                  type="hidden"
                  name="featured"
                  value={isFeatured ? "true" : "false"}
                />
              </Field>

              {notice ? (
                <Alert variant={notice.type === "error" ? "destructive" : "default"}>
                  <AlertTitle>{notice.type === "error" ? "操作失败" : "操作成功"}</AlertTitle>
                  <AlertDescription>{notice.message}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ImagePlus data-icon="inline-start" />
                )}
                {isSaving
                  ? editingProduct
                    ? "保存中..."
                    : "上传中..."
                  : editingProduct
                    ? "保存修改"
                    : "保存商品"}
              </Button>
              {editingProduct ? (
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  <X data-icon="inline-start" />
                  取消编辑
                </Button>
              ) : null}
            </FieldGroup>
            </fieldset>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
          <CardDescription>当前前台会展示的商品内容。</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="flex flex-col gap-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="grid gap-4 border border-border bg-background p-4 md:grid-cols-[120px_1fr_auto]"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-square size-full object-cover md:size-[120px]"
                  />
                  <div className="flex min-w-0 flex-col justify-center gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{product.name}</h3>
                      <Badge variant="outline">{product.category}</Badge>
                      {product.featured ? <Badge>首页精选</Badge> : null}
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <a
                      href={product.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-accent hover:underline"
                    >
                      查看已上传图片
                    </a>
                  </div>
                  <div className="flex items-center md:justify-end">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving || deletingId !== null}
                        onClick={() => startEditing(product)}
                      >
                        <Pencil data-icon="inline-start" />
                        编辑
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isSaving || deletingId !== null}
                        onClick={() => handleDelete(product)}
                      >
                        {deletingId === product.id ? (
                          <Loader2 data-icon="inline-start" className="animate-spin" />
                        ) : (
                          <Trash2 data-icon="inline-start" />
                        )}
                        删除
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-background p-8 text-center">
              <p className="text-sm text-muted-foreground">还没有商品。</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
