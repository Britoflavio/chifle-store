import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chifle.store"),
  title: { default: "Chifle Store | Streetwear desde Córdoba", template: "%s | Chifle Store" },
  description: "Ropa y zapatillas con identidad cordobesa. Comprá online y recibí tu pedido en toda Argentina.",
  keywords: ["streetwear", "ropa urbana", "zapatillas", "Córdoba", "Argentina"],
  openGraph: { title: "Chifle Store | Streetwear desde Córdoba", description: "Prendas y zapatillas para moverte con tu propio código.", locale: "es_AR", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body>{children}</body></html>;
}
