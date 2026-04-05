import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GECAPS Social",
  description: "Painel de gestao de redes sociais da GECAPS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: accounts } = await supabase()
    .from("social_accounts")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-full">
        <ThemeProvider>
          <TooltipProvider>
            <Sidebar accounts={accounts || []} />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar accounts={accounts || []} />
              <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
                {children}
              </main>
            </div>
            <BottomNav />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
