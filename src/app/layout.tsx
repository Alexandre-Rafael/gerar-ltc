import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LTC · Gerador de Stories",
  description: "Gerador de stories dos jogos do Lagoa Tênis Clube",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "Arial, sans-serif" }}>{children}</body>
    </html>
  );
}
