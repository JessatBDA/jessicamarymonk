import Link from "next/link";
import { NameForm } from "@/components/engagement/forms";
import { handsHero } from "@/content/hands-photos";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Add your name",
  "211 people took part. Ask for your name to be added to the thank-you list. It is shown only if you agree, after Jessica checks it.",
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
          211 people took part. The names on the project page are those who
          agreed to be shown, not everyone who took part. If you would like
          your name included, you can send it here. It is added only if you
          tick the permission box and Jessica approves it.
        </p>
      </section>
      <NameForm />
    </article>
  );
}
