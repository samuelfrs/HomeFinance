import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
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
  title: "HomeFinance - Controle de Gastos Residenciais",
  description: "Desafio Técnico de controle de gastos e receitas residenciais com .NET Core e Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
        <Navbar />
        <main className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
