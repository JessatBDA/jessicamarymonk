import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { publishedEntries } from "@/lib/content";
import { publicPath } from "@/lib/content-model";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await publishedEntries("project");
  const artworks = await publishedEntries("artwork");
  return [
    "/",
    "/public-art",
    "/paintings-illustrations",
    "/about",
    "/contact",
    "/privacy",
    "/engagement/share-your-hands",
    "/engagement/add-your-name",
    ...projects.map(publicPath),
    ...artworks.map(publicPath),
  ].map((path) => ({ url: new URL(path, siteUrl).href }));
}
