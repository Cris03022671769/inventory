import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control diario",
  description: "Control de caja e inventario con Next.js, Prisma y Neon.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
