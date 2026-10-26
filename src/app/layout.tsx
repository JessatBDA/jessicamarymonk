import type { Metadata } from "next";
import { PublicFrame } from "@/components/public-frame";
import { siteUrl } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Jessica Mary Monk | Public Artist, Painter & Illustrator",
    template: "%s | Jessica Mary Monk",
  },
  description:
    "Explore public art, community installations, painting and illustration by British artist Jessica Mary Monk.",
  openGraph: {
    siteName: "Jessica Mary Monk",
    locale: "en_GB",
    type: "website",
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
