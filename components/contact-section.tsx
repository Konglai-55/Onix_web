"use client";

import { useEffect, useRef } from "react";
import { MapPin, Phone, Mail, User, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    label: "公司地址",
    value: "广东省花都区狮岭旗岭杨仙路54号",
  },
  {
    icon: Phone,
    label: "联系电话",
    value: "188 2646 9988",
    href: "tel:18826469988",
  },
  {
    icon: Mail,
    label: "电子邮箱",
    value: "kenny@onixbag.com",
    href: "mailto:kenny@onixbag.com",
  },
  {
    icon: User,
    label: "联系人",
    value: "徐桂生",
  },
];

export function ContactSection() {
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
    <section id="contact" ref={sectionRef} className="py-28 lg:py-36 bg-card border-t border-border">
      <div className="container mx-auto px-8 max-w-7xl">

        {/* 标题 */}
        <div className="reveal opacity-0 translate-y-6 mb-16" style={{ transitionDuration: "700ms" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-accent" />
            <span className="text-accent text-[10px] tracking-[0.4em] uppercase font-medium">Contact</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-foreground">联系</span>
            <span className="text-accent"> 我们</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-sm max-w-sm">
            期待与您合作，欢迎随时咨询 OEM/ODM 定制业务
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">

          {/* 联系信息 */}
          <div className="reveal opacity-0 translate-y-8 lg:col-span-2 space-y-3" style={{ transitionDuration: "800ms" }}>
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="group flex items-center gap-4 p-5 bg-background border border-border hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors duration-300">
                  <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground mb-0.5 tracking-wide">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-foreground font-semibold hover:text-accent transition-colors truncate block">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-foreground font-semibold truncate">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* 营业时间 */}
            <div className="p-5 bg-accent/5 border border-accent/15">
              <div className="flex items-center gap-2.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-foreground">营业时间</span>
              </div>
              <p className="text-muted-foreground text-xs">周一至周六 08:30 — 18:00</p>
            </div>
          </div>

          {/* 地图 */}
          <div className="reveal opacity-0 translate-y-8 lg:col-span-3" style={{ transitionDuration: "900ms" }}>
            <div className="bg-background border border-border p-2 h-full min-h-[400px]">
              <iframe
                src="https://map.baidu.com/?latlng=23.420648,113.218883&title=广州欧尼士箱包有限公司&content=广东省花都区狮岭旗岭杨仙路54号&autoOpen=true&l=17&tn=B_NORMAL_MAP&c=12619815.43,2715574.26&s=s%26wd%3D广东省花都区狮岭旗岭杨仙路54号"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px", filter: "saturate(0.8) contrast(1.05)" }}
                allowFullScreen
                loading="lazy"
                title="广州欧尼士箱包有限公司位置"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
