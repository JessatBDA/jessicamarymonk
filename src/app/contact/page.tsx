import { ContactView } from "@/components/pages/contact";
import { requirePublished } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const {
    body: { fields: f },
  } = await requirePublished("page", "contact");
  return pageMetadata(
    f.seo_title || "Contact",
    f.seo_description ||
      "Write to Jessica Mary Monk at info@jessicamarymonk.com about public art, paintings and illustration.",
    "/contact",
  );
}
export default async function Page() {
  return <ContactView entry={await requirePublished("page", "contact")} />;
}
