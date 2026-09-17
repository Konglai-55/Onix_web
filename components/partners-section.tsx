"use client";

import { useEffect, useRef } from "react";

export function PartnersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: "15+", label: "国家" },
    { number: "50+", label: "国际品牌" },
    { number: "100K+", label: "订单量" },
    { number: "15+", label: "年合作经验" },
  ];

  return (
    <section id="partners" ref={sectionRef} className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="container mx-auto px-8 max-w-7xl">
        {/* 标题 */}
        <div className="reveal opacity-0 translate-y-6 mb-20 text-center" style={{ transitionDuration: "700ms" }}>
          <span className="text-muted-foreground text-[10px] tracking-[0.4em] uppercase block mb-4 font-medium">全球合作</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            与全球领先企业合作
          </h2>
        </div>

        {/* 合作统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="reveal opacity-0 translate-y-6 text-center"
              style={{ transitionDuration: `${700 + index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-accent mb-3">
                {stat.number}
              </div>
              <p className="text-foreground/60 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 描述文案 */}
        <div className="reveal opacity-0 translate-y-6 mt-20 text-center" style={{ transitionDuration: "1100ms" }}>
          <p className="text-foreground/50 text-sm max-w-2xl mx-auto leading-relaxed">
            专业的全球代工合作伙伴，为众多国际知名品牌提供高质量箱包制造与定制服务。
          </p>
        </div>
      </div>
    </section>
  );
}
