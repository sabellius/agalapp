import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/app/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
  subsets: ["hebrew"],
});

export const viewport: Viewport = {
  themeColor: "#3D2817",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "עגלאפ - עגלות קפה בישראל",
    template: "%s",
  },
  description:
    "גלה עגלות קפה מובילות, קרא ביקורות ומצא את הקפה המושלם על גלגלים",
  keywords: ["עגלות קפה", "קפה על גלגלים", "ביקורות קפה", "מפת קפה", "ישראל"],
  authors: [{ name: "AgalApp" }],
  openGraph: {
    siteName: "עגלאפ",
    locale: "he_IL",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@agalapp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={cn("font-sans", geist.variable)}>
      <body className={cn(notoSansHebrew.className, "antialiased")}>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
