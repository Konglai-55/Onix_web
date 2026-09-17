import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <Header solid />
      <section className="border-b border-border pt-28 pb-10 lg:pt-32">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-56" />
              <Skeleton className="h-5 w-full max-w-xl" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="mt-10 flex flex-col gap-5 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-24" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-secondary/25 py-12 lg:py-16">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border border-border bg-background">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="border-t border-border px-5 py-3.5">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
