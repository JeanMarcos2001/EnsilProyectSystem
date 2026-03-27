import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sistema ENSIL",
  description: "Sistema de Gestión Empresarial ENSIL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`h-full ${plusJakarta.variable}`}>
      <body className="min-h-full font-sans antialiased bg-[var(--color-app-bg)] text-[var(--color-text-primary)]">
        {children}
      </body>
    </html>
  );
}

