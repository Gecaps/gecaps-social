"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Account } from "@/modules/accounts/types";

interface AccountSwitcherProps {
  accounts: Account[];
  currentId: string | null;
}

export function AccountSwitcher({ accounts, currentId }: AccountSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const current = accounts.find(a => a.id === currentId) || accounts[0];

  return (
    <div className="px-3 pb-2">
      <select
        value={current?.id || ""}
        onChange={(e) => {
          const newId = e.target.value;
          if (!newId) {
            router.push("/contas");
            return;
          }
          // Replace current accountId segment in pathname
          const segments = pathname.split("/");
          if (segments.length >= 2) {
            segments[1] = newId;
            router.push(segments.join("/"));
          } else {
            router.push(`/${newId}/metricas`);
          }
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
