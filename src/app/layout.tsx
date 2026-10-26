import type { Metadata } from "next";
import portrait from "../../images/jess-portrait.jpg";
import { PublicFrame } from "@/components/public-frame";
import { artistTagline } from "@/lib/artist-copy";
import { siteUrl } from "@/lib/site";
import "./globals.css";
const portraitCard = {
  url: portrait.src,
  width: portrait.width,
  height: portrait.height,
  alt: "Jessica Mary Monk smiling, holding her dog on a beach at sunset",
};
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
    images: [portraitCard],
  },
  twitter: {
    card: "summary_large_image",
    description: artistTagline,
    images: [portrait.src],
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
