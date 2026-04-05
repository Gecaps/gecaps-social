"use client";

import { Bell, Settings, Search, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "./mobile-nav";
import { CreatePostModal } from "@/components/post/create-post-modal";
import type { Account } from "@/lib/types";

interface TopbarProps {
  accounts: Account[];
}

export function Topbar({ accounts }: TopbarProps) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex justify-between items-center px-4 lg:px-8">
        {/* Mobile: logo */}
        <div className="flex items-center gap-3 lg:hidden">
          <MobileNav />
          <span className="text-lg font-heading font-extrabold uppercase tracking-tighter">GECAPS</span>
        </div>

        {/* Desktop: search */}
        <div className="hidden lg:flex items-center">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              className="bg-muted border-none rounded-full pl-10 pr-4 py-2 text-xs w-64 focus:ring-1 focus:ring-primary focus:bg-card transition-all placeholder:text-muted-foreground"
              placeholder="Buscar posts..."
              type="text"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="lg:hidden bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
          >
            <Plus className="size-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="size-[18px]" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden lg:flex text-muted-foreground hover:text-foreground">
            <Settings className="size-[18px]" />
          </Button>
          <div className="hidden lg:block h-6 w-px bg-border mx-2" />
          <span className="hidden lg:block text-sm font-semibold">GECAPS Social</span>
        </div>
      </header>

      <CreatePostModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        accounts={accounts}
      />
    </>
  );
}
