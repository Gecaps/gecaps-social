"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileNav />
        <Image
          src="/assets/logo-gecaps.png"
          alt="GECAPS"
          width={80}
          height={20}
          priority
          className="dark:hidden"
        />
        <Image
          src="/assets/logo-gecaps-white.png"
          alt="GECAPS"
          width={80}
          height={20}
          priority
          className="hidden dark:block"
        />
        <span className="rounded-md bg-neon-pink/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-pink">
          Social
        </span>
      </div>

      <div className="hidden lg:block">
        <h1 className="text-sm font-medium text-muted-foreground">
          Painel de Redes Sociais
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
        </Button>
        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink text-xs font-bold text-white lg:hidden">
          A
        </div>
      </div>
    </header>
  );
}
