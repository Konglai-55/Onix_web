import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductList } from "@/components/product-list";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "全部商品 | ONIX 欧尼士",
  description: "ONIX 欧尼士全部商品排列页，展示可定制箱包、硬壳背包、LED 背包和更多产品。",
};

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string | string[];
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts();
  const resolvedSearchParams = await searchParams;
  const category = Array.isArray(resolvedSearchParams?.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams?.category;

  return (
    <main className="flex min-h-screen flex-col justify-between bg-background">
      <div>
        <Header solid />
        <ProductList products={products} initialCategory={category} />
      </div>
      <Footer />
    </main>
  );
}
