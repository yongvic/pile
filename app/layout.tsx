import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: { default: "Pile", template: "%s · Pile" },
  description: "Des stages et des jobs vérifiés, pile pour ton profil, au Togo.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} ${fraunces.variable} min-h-dvh bg-paper font-sans text-ink antialiased`}>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <div id="contenu">{children}</div>
      </body>
    </html>
  );
}
