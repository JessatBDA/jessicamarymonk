import { AboutView } from "@/components/pages/about";
import { requirePublished } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const {
    body: { fields: f },
  } = await requirePublished("page", "about");
  return pageMetadata(
    f.seo_title || "About",
    f.seo_description ||
      "About Jessica Mary Monk, British public artist, painter and illustrator.",
    "/about",
  );
}
export default async function Page() {
  return <AboutView entry={await requirePublished("page", "about")} />;
}
