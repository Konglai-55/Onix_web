import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProductsSection } from "@/components/products-section";
import { PartnersSection } from "@/components/partners-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.featured);
  const homeProducts = featuredProducts.slice(0, 6);

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProductsSection products={homeProducts} />
      <PartnersSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
