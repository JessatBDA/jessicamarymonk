import portrait from "../../../images/jess-portrait.jpg";
import { AboutView } from "@/components/pages/about";
import { metaDescription } from "@/lib/artist-copy";
import { requirePublished } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const {
    body: { fields: f },
  } = await requirePublished("page", "about");
  return pageMetadata(
    f.seo_title || "About",
    metaDescription(f.seo_description),
    "/about",
    {
      url: portrait.src,
      alt: "Jessica Mary Monk smiling, holding her dog on a beach at sunset",
      width: portrait.width,
      height: portrait.height,
    },
  );
}
export default async function Page() {
  return <AboutView entry={await requirePublished("page", "about")} />;
}
