import Link from "next/link";
import { NameForm } from "@/components/engagement/forms";
import { handsHero } from "@/content/hands-photos";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Add your name",
  "Ask for your name to be added to the thank-you list for The Hands of Worcester. It is shown only with your permission, after Jessica checks it.",
  "/engagement/add-your-name",
  {
    url: handsHero.src,
    alt: handsHero.alt,
    width: handsHero.width,
    height: handsHero.height,
  },
);

export default function Page() {
  return (
    <article className="wrap share-page">
      <section className="page-intro">
        <Link
          className="back-link"
          href="/public-art/the-hands-of-worcester#participants"
        >
          ← Back to the names
        </Link>
        <p className="eyebrow">The Hands of Worcester</p>
        <h1>Add your name to the list.</h1>
        <p>
          If you took part, or you would like to be thanked with the project,
          you can send your name here. It is added to the website only if you
          tick the permission box and Jessica approves it.
        </p>
      </section>
      <NameForm />
    </article>
  );
}
