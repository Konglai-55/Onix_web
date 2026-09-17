"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function AboutSection() {
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

  return (
    <section id="about" ref={sectionRef} className="py-32 lg:py-48 bg-background">
      <div className="container mx-auto px-8 max-w-7xl">

        {/* 顶部: 标题 + 简述 */}
        <div className="reveal opacity-0 -translate-y-8 mb-24 text-center" style={{ transitionDuration: "800ms" }}>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight mb-8">
            <span className="text-foreground">精工</span>
            <span className="text-accent"> 欧尼士</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            20年专注高端箱包制造，为全球顶级品牌提供定制解决方案
          </p>
        </div>

        {/* 核心指标 - 3列 */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            { number: "20+", label: "年制造经验", detail: "持续创新与完善" },
            { number: "15+", label: "外观专利", detail: "自主研发成果" },
            { number: "100+", label: "知名品牌", detail: "全球合作伙伴" },
          ].map((item, idx) => (
            <div
              key={item.label}
              className="reveal opacity-0 translate-y-6"
              style={{
                transitionDuration: "800ms",
                transitionDelay: `${idx * 150}ms`,
              }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">{item.number}</div>
                <div className="text-sm font-semibold text-foreground tracking-wide">{item.label}</div>
                <div className="text-xs text-muted-foreground mt-2">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 工艺展示 - 2图 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* 工艺细节 */}
          <div
            className="reveal opacity-0 -translate-x-8"
            style={{ transitionDuration: "800ms" }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-card group">
              <Image
                src="/about-craftsmanship.jpg"
                alt="精湛工艺细节"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-8">
                <div>
                  <div className="text-white text-xs tracking-[0.3em] font-medium mb-2">精工工艺</div>
                  <div className="text-white text-lg font-bold">精细打造每一处</div>
                </div>
              </div>
            </div>
          </div>

          {/* 材质展示 */}
          <div
            className="reveal opacity-0 translate-x-8"
            style={{ transitionDuration: "800ms" }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-card group">
              <Image
                src="/about-materials.jpg"
                alt="高端材料展示"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-8">
                <div>
                  <div className="text-white text-xs tracking-[0.3em] font-medium mb-2">核心材料</div>
                  <div className="text-white text-lg font-bold">EVA · ABS · PC</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 三大认证 - 横列 */}
        <div className="reveal opacity-0 translate-y-6 mb-20" style={{ transitionDuration: "800ms" }}>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {[
              { cert: "ISO 9001", text: "质量管理体系认证" },
              { cert: "BSCI", text: "商业责任认证" },
              { cert: "15+", text: "外观设计专利" },
            ].map((item) => (
              <div key={item.cert} className="bg-background p-8 text-center hover:bg-accent/5 transition-colors">
                <div className="text-sm tracking-widest font-bold text-accent mb-3">{item.cert}</div>
                <div className="text-xs text-muted-foreground">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 品牌介绍 */}
        <div className="reveal opacity-0 translate-y-6" style={{ transitionDuration: "800ms" }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4">自有品牌</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                旗下两大自有品牌 ONIX 和 NAMA，承载我们对高端箱包设计与品质的追求。精选材料、精密工艺、精心设计——每一款产品都是卓越的体现。
              </p>
              <div className="flex gap-3">
                <span className="px-5 py-3 bg-foreground text-background text-xs font-bold tracking-widest">
                  ONIX
                </span>
                <span className="px-5 py-3 bg-accent text-accent-foreground text-xs font-bold tracking-widest">
                  NAMA
                </span>
              </div>
            </div>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              <p>
                在全球高端箱包市场竞争中，欧尼士凭借创新的热压吸塑成型工艺和严苛的质量控制体系，赢得了超过 20+ 知名品牌的长期信赖。
              </p>
              <p>
                我们不仅生产产品，更致力于创造高端消费者期待的优质体验——从材料选择到最后一道工序，每个细节都经过精心打磨。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
