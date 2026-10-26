import type { Metadata } from "next";
import { PublicFrame } from "@/components/public-frame";
import { artistTagline } from "@/lib/artist-copy";
import { siteUrl } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Jessica Mary Monk | Public Artist, Painter & Illustrator",
    template: "%s | Jessica Mary Monk",
  },
  description: artistTagline,
  openGraph: {
    siteName: "Jessica Mary Monk",
    locale: "en_GB",
    type: "website",
    description: artistTagline,
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        <PublicFrame>{children}</PublicFrame>
      </body>
    </html>
  );
}
