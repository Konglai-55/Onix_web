import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { readProductsData, writeProductsData } from "@/lib/rains3";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  featured: boolean;
  createdAt: string;
};

export type ProductInput = {
  name: string;
  category?: string;
  description: string;
  imageUrl: string;
  imageKey?: string;
  featured?: boolean;
};

const productsFile = process.env.PRODUCTS_FILE
  ? path.resolve(process.env.PRODUCTS_FILE)
  : path.join(process.cwd(), "data", "products.json");
let mutationQueue: Promise<unknown> = Promise.resolve();
let storageRetryAt = 0;

function normalizeProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const product = item as Record<string, unknown>;
      return (
        typeof product.id === "string" &&
        typeof product.slug === "string" &&
        typeof product.name === "string" &&
        typeof product.category === "string" &&
        typeof product.description === "string" &&
        typeof product.imageUrl === "string" &&
        typeof product.createdAt === "string"
      );
    })
    .map((product) => ({
      id: product.id as string,
      slug: product.slug as string,
      name: product.name as string,
      category: product.category as string,
      description: product.description as string,
      imageUrl: product.imageUrl as string,
      imageKey: typeof product.imageKey === "string" ? product.imageKey : undefined,
      featured: typeof product.featured === "boolean" ? product.featured : true,
      createdAt: product.createdAt as string,
    }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getProducts(): Promise<Product[]> {
  let seedStorage = false;
  if (Date.now() >= storageRetryAt) {
    try {
      const content = await readProductsData();
      if (content !== null) return normalizeProducts(JSON.parse(content));
      seedStorage = true;
    } catch (error) {
      // ponytail: Retry storage once a minute; use a shared cache if one process becomes many.
      storageRetryAt = Date.now() + 60_000;
      console.warn("RainS3 商品读取失败，暂用本地副本：", error instanceof Error ? error.message : error);
    }
  }

  try {
    const localContent = await readFile(productsFile, "utf8");
    const products = normalizeProducts(JSON.parse(localContent));
    if (seedStorage && products.length > 0) {
      try {
        await writeProductsData(`${JSON.stringify(products, null, 2)}\n`);
      } catch (error) {
        storageRetryAt = Date.now() + 60_000;
        console.warn("RainS3 商品初始化失败，继续使用本地副本：", error instanceof Error ? error.message : error);
      }
    }
    return products;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return enqueueMutation(async () => {
    const products = await getProducts();
    const now = new Date();
    const product: Product = {
      id: randomUUID(),
      slug: createUniqueSlug(input.name, products),
      name: input.name.trim(),
      category: input.category?.trim() || "Product",
      description: input.description.trim(),
      imageUrl: input.imageUrl.trim(),
      imageKey: input.imageKey?.trim() || undefined,
      featured: input.featured ?? false,
      createdAt: now.toISOString(),
    };

    await saveProducts([product, ...products]);
    return product;
  });
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | null> {
  return enqueueMutation(async () => {
    const products = await getProducts();
    const index = products.findIndex((product) => product.id === id);

    if (index < 0) {
      return null;
    }

    const current = products[index];
    const updated: Product = {
      ...current,
      name: input.name === undefined ? current.name : input.name.trim(),
      category:
        input.category === undefined
          ? current.category
          : input.category.trim() || "Product",
      description:
        input.description === undefined
          ? current.description
          : input.description.trim(),
      imageUrl:
        input.imageUrl === undefined ? current.imageUrl : input.imageUrl.trim(),
      imageKey:
        input.imageKey === undefined
          ? current.imageKey
          : input.imageKey.trim() || undefined,
      featured: input.featured === undefined ? current.featured : input.featured,
    };

    products[index] = updated;
    await saveProducts(products);
    return updated;
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  return enqueueMutation(async () => {
    const products = await getProducts();
    const nextProducts = products.filter((product) => product.id !== id);

    if (nextProducts.length === products.length) {
      return false;
    }

    await saveProducts(nextProducts);
    return true;
  });
}

async function saveProducts(products: Product[]) {
  await writeProductsData(`${JSON.stringify(products, null, 2)}\n`);
  await mkdir(path.dirname(productsFile), { recursive: true });
  const temporaryFile = `${productsFile}.${process.pid}.${randomUUID()}.tmp`;

  await writeFile(temporaryFile, `${JSON.stringify(products, null, 2)}\n`, "utf8");

  try {
    await rename(temporaryFile, productsFile);
  } finally {
    await rm(temporaryFile, { force: true });
  }
}

function enqueueMutation<T>(mutation: () => Promise<T>) {
  const operation = mutationQueue.then(mutation, mutation);
  mutationQueue = operation.then(
    () => undefined,
    () => undefined
  );
  return operation;
}

function createUniqueSlug(name: string, products: Product[]) {
  const baseSlug =
    name
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `product-${Date.now()}`;

  const usedSlugs = new Set(products.map((product) => product.slug));

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  let slug = `${baseSlug}-${index}`;

  while (usedSlugs.has(slug)) {
    index += 1;
    slug = `${baseSlug}-${index}`;
  }

  return slug;
}
