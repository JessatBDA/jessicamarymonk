import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/shop",
        "/engagement/the-hands-of-worcester",
        "/engagement/share-your-hands/leaflet",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
