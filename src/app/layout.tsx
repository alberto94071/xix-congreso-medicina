import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Registro - XIX Congreso de Medicina",
  description: "Registro y diplomas para el XIX Congreso de Medicina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
