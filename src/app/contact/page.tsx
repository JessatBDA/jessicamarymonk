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
      "Enquiries about public art, painting and illustration.",
    "/contact",
  );
}
export default async function Page() {
  return <ContactView entry={await requirePublished("page", "contact")} />;
}
