"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import type { Account } from "@/modules/accounts/types";

interface TopbarProps {
  account: Account;
}

export function Topbar({ account }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 flex justify-between items-center px-4 lg:px-8">
      {/* Account info */}
      <div className="flex items-center gap-3">
        {account.avatar_url ? (
          <img
            src={account.avatar_url}
            alt={account.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/60 text-xs font-bold text-primary-foreground">
            {account.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">{account.name}</span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            @{account.handle}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
