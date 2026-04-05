"use client";

import Image from "next/image";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileNav />
        <Image
          src="/assets/logo-gecaps.png"
          alt="GECAPS"
          width={90}
          height={23}
          priority
        />
      </div>

      <div className="hidden lg:block">
        <h1 className="text-sm font-medium text-muted-foreground">
          Painel de Redes Sociais
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
        </Button>
        <div className="flex size-8 items-center justify-center rounded-full bg-gecaps-green text-xs font-bold text-white lg:hidden">
          A
        </div>
      </div>
    </header>
  );
}
