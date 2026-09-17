"use client";

import { Phone, Mail, MapPin, ArrowUp, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const footerLinks = [
  {
    title: "导航",
    links: [
      { name: "首页", href: "#hero" },
      { name: "关于我们", href: "#about" },
      { name: "产品展示", href: "#products" },
      { name: "合作品牌", href: "#partners" },
    ],
  },
  {
    title: "产品系列",
    links: [
      { name: "LED硬壳背包", href: "#products" },
      { name: "硬壳个性背包", href: "#products" },
      { name: "LED儿童背包", href: "#products" },
      { name: "硬壳球拍包", href: "#products" },
    ],
  },
];

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-foreground text-background">
      {/* CTA 横幅 */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-8 max-w-7xl py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-background leading-tight">
                准备开始合作了吗？
              </h3>
              <p className="text-background/50 mt-2 text-sm">
                立即联系我们，获取专业的 OEM/ODM 定制方案
              </p>
            </div>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-accent/90 transition-colors whitespace-nowrap"
            >
              立即咨询
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-8 max-w-7xl py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* 品牌 */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Image
                src="/onix-logo.svg"
                alt="ONIX 欧尼士"
                width={150}
                height={40}
                className="h-6 w-auto"
              />
            </div>
            <p className="text-background/50 text-sm leading-relaxed">
              广州欧尼士箱包有限公司，专业从事EVA、ABS等特殊材料箱包的研发与生产。
            </p>
          </div>

          {/* 链接 */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-background text-xs font-semibold mb-5 tracking-[0.2em] uppercase">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-background/50 hover:text-background transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 联系方式 */}
          <div>
            <h4 className="text-background text-xs font-semibold mb-5 tracking-[0.2em] uppercase">联系方式</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-background/50 text-sm leading-relaxed">
                  广州市花都区狮岭镇旗岭杨仙路54号
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <a href="tel:18826469988" className="text-background/50 hover:text-background transition-colors text-sm">
                  188 2646 9988
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <a href="mailto:kenny@onixbag.com" className="text-background/50 hover:text-background transition-colors text-sm">
                  kenny@onixbag.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 底部栏 */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-8 max-w-7xl py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/30 text-xs">
              © {new Date().getFullYear()} 广州欧尼士箱包有限公司 版权所有
            </p>
            <div className="flex items-center gap-5">
              <span className="text-background/20 text-xs">ISO9001</span>
              <span className="text-background/20 text-xs">BSCI</span>
              <span className="text-background/20 text-xs">3A企业认证</span>
            </div>
          </div>
        </div>
      </div>

      {/* 回到顶部 */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-11 h-11 bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:bg-accent/90 transition-colors z-50"
        aria-label="回到顶部"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
