"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Account } from "@/lib/types";

interface AccountSwitcherProps {
  accounts: Account[];
  currentId: string | null;
}

export function AccountSwitcher({ accounts, currentId }: AccountSwitcherProps) {
  const router = useRouter();
  const current = accounts.find(a => a.id === currentId) || accounts[0];

  return (
    <div className="px-3 pb-2">
      <select
        value={current?.id || ""}
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          params.set("account", e.target.value);
          router.push(`/?${params.toString()}`);
        }}
        className="w-full rounded-lg border border-border bg-sidebar px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todas as contas</option>
        {accounts.map(a => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.handle})
          </option>
        ))}
      </select>
    </div>
  );
}
