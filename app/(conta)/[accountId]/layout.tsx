import { notFound } from "next/navigation";
import { getAccountById, listAccounts } from "@/modules/accounts/queries";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/mobile-nav";

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const [account, accounts] = await Promise.all([
    getAccountById(accountId),
    listAccounts(),
  ]);

  if (!account) notFound();

  return (
    <>
      <Sidebar accounts={accounts} currentAccountId={accountId} />
      <div className="flex flex-col min-h-full lg:ml-64">
        <Topbar account={account} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav accountId={accountId} />
    </>
  );
}
