"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

type ProductsSectionProps = {
  products: Product[];
};

export function ProductsSection({ products }: ProductsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    sectionRef.current?.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      sectionRef.current?.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.05 }
    );
    const elements = sectionRef.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="products" ref={sectionRef} className="py-28 lg:py-36 bg-card border-t border-border">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="reveal opacity-0 translate-y-6 mb-16" style={{ transitionDuration: "700ms" }}>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-accent" />
                <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-medium">Featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-foreground">精选</span>
                <span className="text-accent"> 产品</span>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-5 md:items-end">
              <p className="text-muted-foreground text-sm md:text-right leading-relaxed max-w-xs">
                首页仅展示六款精选商品<br />
                进入产品展示页查看完整商品排列
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-accent px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                更多商品
              </Link>
            </div>
          </div>
        </div>

        <div className="reveal opacity-0 translate-y-8" style={{ transitionDuration: "800ms" }}>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href="/products"
                  className="group relative bg-background overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={`进入更多商品页面：${product.name}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={cn(
                        "size-full object-cover transition-transform duration-700",
                        hovered === index ? "scale-105" : "scale-100"
                      )}
                    />
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      hovered === index
                        ? "bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-100"
                        : "bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-80"
                    )} />

                    <div className="absolute top-5 left-5">
                      <span className="text-4xl font-bold text-white/10 tracking-tighter">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className={cn(
                      "absolute top-5 right-5 size-10 bg-accent flex items-center justify-center transition-all duration-400",
                      hovered === index ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                    )}>
                      <ArrowUpRight className="size-4 text-accent-foreground" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="text-accent text-[10px] tracking-[0.3em] uppercase font-medium block mb-2">
                        {product.category}
                      </span>
                      <h3 className="text-white text-xl font-bold tracking-tight">{product.name}</h3>
                      <p className={cn(
                        "text-white/70 text-xs leading-relaxed mt-2 transition-all duration-500 overflow-hidden",
                        hovered === index ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {product.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-background border border-border p-12 text-center">
              <h3 className="text-xl font-bold text-foreground">暂无产品</h3>
              <p className="mt-3 text-sm text-muted-foreground">后台上传商品后会自动显示在这里。</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
