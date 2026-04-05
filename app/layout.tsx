import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider>
          <TooltipProvider>
            <Sidebar accounts={accounts || []} />
            <div className="flex flex-col min-h-full lg:ml-64">
              <Topbar accounts={accounts || []} />
              <main className="flex-1 pb-20 lg:pb-0">
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
