"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const allCategory = "全部";
const PAGE_SIZE = 12;

type ProductListProps = {
  products: Product[];
  initialCategory?: string;
};

function getCategoryHref(category: string) {
  return category === allCategory
    ? "/products"
    : `/products?category=${encodeURIComponent(category)}`;
}

function getInitialCategory(products: Product[], category?: string) {
  if (!category || category === allCategory) {
    return allCategory;
  }

  return products.some((product) => product.category === category) ? category : allCategory;
}

export function ProductList({ products, initialCategory }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState(() =>
    getInitialCategory(products, initialCategory)
  );
  const categories = useMemo(
    () => [allCategory, ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );
  const filteredProducts = useMemo(
    () =>
      selectedCategory === allCategory
        ? products
        : products.filter((product) => product.category === selectedCategory),
    [products, selectedCategory]
  );
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [selectedCategory]);

  useEffect(() => {
    const handlePopState = () => {
      const category = new URLSearchParams(window.location.search).get("category");
      setSelectedCategory(getInitialCategory(products, category ?? undefined));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products]);

  const handleCategoryClick = (
    event: MouseEvent<HTMLAnchorElement>,
    category: string
  ) => {
    event.preventDefault();
    setSelectedCategory(category);
    window.history.pushState(null, "", getCategoryHref(category));
  };

  return (
    <>
      <section className="border-b border-border pt-28 pb-10 lg:pt-32">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-8 bg-accent" />
                <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-accent">
                  Shop
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                全部商品
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                首页只展示精选款式，更多商品统一排列在这里。商品图片统一从已配置的存储地址加载。
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/#contact">
                定制咨询
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              共{" "}
              <span className="font-semibold text-foreground">
                {filteredProducts.length}
              </span>{" "}
              件商品
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <Link
                    key={category}
                    href={getCategoryHref(category)}
                    aria-pressed={isSelected}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "inline-flex h-7 items-center justify-center border px-3 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={(event) => handleCategoryClick(event, category)}
                  >
                    {category}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/25 py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl px-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-md"
                >
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 opacity-90 backdrop-blur-sm">
                        <Badge variant="secondary" className="font-normal">
                          {product.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h2 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-accent">
                        {product.name}
                      </h2>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3.5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                        OEM / ODM
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                        查看详情
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border bg-card p-16 text-center">
              <h2 className="text-lg font-semibold">暂无相关商品</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                该分类下暂时没有商品，可以前往后台上传或查看其他分类。
              </p>
            </div>
          )}
          {pageCount > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</Button>
              <span className="px-3 text-sm text-muted-foreground">第 {page} / {pageCount} 页</span>
              <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>下一页</Button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
