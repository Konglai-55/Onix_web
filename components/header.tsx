"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "首页", href: "/#hero" },
  { name: "关于", href: "/#about" },
  { name: "产品", href: "/products" },
  { name: "合作", href: "/#partners" },
  { name: "联系", href: "/#contact" },
];

type HeaderProps = {
  solid?: boolean;
};

export function Header({ solid = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSolid = solid || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isSolid
          ? "bg-background/95 backdrop-blur-xl border-b border-border py-4 shadow-sm"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-8 max-w-7xl">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="/#hero" className="flex items-center">
            <Image
              src="/onix-logo.svg"
              alt="ONIX 欧尼士"
              width={200}
              height={56}
              className="h-8 w-auto transition-opacity duration-300"
              priority
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  "relative text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 py-2 group",
                  isSolid
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:block">
            <a
              href="/#contact"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 text-xs font-medium tracking-[0.15em] uppercase transition-all duration-300 border",
                isSolid
                  ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  : "border-white/40 text-white hover:border-white hover:bg-white/10"
              )}
            >
              立即咨询
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "lg:hidden p-2 transition-colors",
              isSolid ? "text-foreground" : "text-white"
            )}
            aria-label="切换菜单"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-background z-40 transition-all duration-500",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-8 pt-28 pb-12 h-full flex flex-col">
          <div className="flex-1 flex flex-col justify-center gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-3xl font-bold text-foreground hover:text-accent transition-colors py-5 border-b border-border"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <a
            href="/#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center justify-center bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-widest uppercase mt-8"
          >
            立即咨询
          </a>
        </div>
      </div>
    </header>
  );
}
