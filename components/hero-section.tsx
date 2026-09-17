"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heroRef.current?.classList.add("reveal-ready");
    const elements = heroRef.current?.querySelectorAll(".reveal");
    const timer = setTimeout(() => {
      elements?.forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), i * 150);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* 全屏背景图 */}
      <Image
        src="/hero-model.jpg"
        alt="ONIX 欧尼士 高端箱包"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        quality={100}
      />

      {/* 遮罩层：轻薄，保留图片质感 */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      {/* 居中内容 */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">
        {/* 标签 */}
        <div className="reveal opacity-0 translate-y-4 mb-8 flex items-center gap-4" style={{ transitionDuration: "900ms" }}>
          <div className="w-8 h-px bg-white/50" />
          <span className="text-white/70 text-[10px] tracking-[0.5em] uppercase font-medium">
            Premium Bag Manufacturer
          </span>
          <div className="w-8 h-px bg-white/50" />
        </div>

        {/* 主标题 */}
        <div className="reveal opacity-0 translate-y-6 mb-5" style={{ transitionDuration: "1000ms" }}>
          <Image
            src="/onix-logo.svg"
            alt="ONIX"
            width={400}
            height={100}
            className="h-24 w-auto mx-auto"
            priority
          />
        </div>

        {/* 副标题 */}
        <div className="reveal opacity-0 translate-y-4 mb-10" style={{ transitionDuration: "1000ms" }}>
          <p className="text-white/55 text-sm md:text-base tracking-[0.25em] font-light uppercase">
            高端定制箱包制造商
          </p>
        </div>

        {/* CTA 按钮 */}
        <div className="reveal opacity-0 translate-y-4 flex flex-col sm:flex-row items-center gap-3" style={{ transitionDuration: "1000ms" }}>
          <a
            href="#products"
            className="bg-accent text-accent-foreground px-10 py-3.5 text-xs font-semibold tracking-[0.25em] uppercase hover:bg-accent/90 transition-all duration-300"
          >
            探索产品
          </a>
          <a
            href="#contact"
            className="border border-white/35 text-white/80 px-10 py-3.5 text-xs font-semibold tracking-[0.25em] uppercase hover:border-white/70 hover:text-white transition-all duration-300"
          >
            联系我们
          </a>
        </div>
      </div>


    </section>
  );
}
