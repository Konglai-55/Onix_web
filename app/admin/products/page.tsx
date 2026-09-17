import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminProductsManager } from "@/components/admin-products-manager";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, verifyAdminPassword, verifyAdminSession } from "@/lib/admin-auth";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "商品后台 | ONIX 欧尼士",
};

type AdminProductsPageProps = {
  searchParams?: Promise<{
    uploaded?: string | string[];
    uploadError?: string | string[];
    loginError?: string | string[];
  }>;
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const cookieStore = await cookies();
  const isAuthenticated = verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null);

  async function login(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    if (!verifyAdminPassword(password)) redirect("/admin/products?loginError=1");

    (await cookies()).set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin/products");
  }

  async function logout() {
    "use server";
    (await cookies()).delete(ADMIN_SESSION_COOKIE);
    redirect("/admin/products");
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background">
        <Header solid />
        <section className="flex min-h-screen items-center justify-center px-6 pt-20">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>进入商品后台</CardTitle>
              <CardDescription>请输入后台口令后继续。</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={login} className="space-y-4">
                <Input name="password" type="password" placeholder="后台口令" required autoFocus />
                {getParam(resolvedSearchParams?.loginError) ? (
                  <p className="text-sm text-destructive">后台口令不正确。</p>
                ) : null}
                <Button type="submit" className="w-full">进入后台</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  const products = await getProducts();
  const uploadError = getParam(resolvedSearchParams?.uploadError);
  const uploaded = getParam(resolvedSearchParams?.uploaded);
  const initialNotice = uploadError
    ? { type: "error" as const, message: uploadError }
    : uploaded
      ? {
          type: "success" as const,
          message: "商品已保存，已写入后台列表；如果前台页面已经打开，请刷新后查看。",
        }
      : null;

  return (
    <main className="min-h-screen bg-background">
      <Header solid />
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-accent" />
              <span className="text-[10px] font-medium uppercase tracking-[0.4em] text-accent">
                Admin
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">商品后台</h1>
              <form action={logout}><Button type="submit" variant="outline">退出</Button></form>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              上传本地商品图片、产品名和简介。图片会保存到 RainS3 存储，前台直接读取存储返回的 DNS 地址。
            </p>
          </div>
        </div>
      </section>

      <section className="pb-28 lg:pb-36">
        <div className="container mx-auto max-w-7xl px-8">
          <AdminProductsManager
            initialProducts={products}
            initialNotice={initialNotice}
          />
        </div>
      </section>
    </main>
  );
}
