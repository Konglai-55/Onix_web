import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "产品不存在 | ONIX 欧尼士",
    };
  }

  return {
    title: `${product.name} | ONIX 欧尼士`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <Header solid />
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto max-w-7xl px-8">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/products">
              <ArrowLeft data-icon="inline-start" />
              返回产品展示
            </Link>
          </Button>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:gap-16">
            <div className="overflow-hidden bg-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="aspect-[4/5] size-full object-cover lg:aspect-[5/4]"
              />
            </div>

            <div className="flex flex-col justify-center gap-7">
              <Badge variant="outline">{product.category}</Badge>
              <div className="flex flex-col gap-5">
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  {product.name}
                </h1>
                <p className="text-base leading-8 text-muted-foreground">
                  {product.description}
                </p>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-3">
                {["OEM/ODM", "存储加速", "定制生产"].map((item) => (
                  <div key={item} className="bg-background p-5 text-center text-xs font-semibold tracking-[0.2em]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/#contact">
                    <MessageCircle data-icon="inline-start" />
                    咨询此产品
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a href={product.imageUrl} target="_blank" rel="noreferrer">
                    <ExternalLink data-icon="inline-start" />
                    查看原图
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
