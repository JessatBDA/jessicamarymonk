import Link from "next/link";
import { EnquiryForm } from "@/components/contact/enquiry-form";
import { Brushstroke } from "@/components/visuals";
import { Lines, RichText } from "@/components/content-render";
import { contactDetails } from "@/lib/artist-copy";
import { publicContactEmail } from "@/lib/contact-public";
import type { Entry } from "@/lib/content-model";

export function ContactView({ entry }: { entry: Entry }) {
  const f = entry.body.fields;
  return (
    <div className="wrap">
      <section className="page-intro">
        <p className="eyebrow">Commissions & collaborations</p>
        <h1>
          <Lines text={f.heading || ""} />
        </h1>
        <p>{f.intro}</p>
        <Brushstroke />
      </section>
      <div className="form-layout">
        <aside>
          <h2>Get in touch</h2>
          <RichText text={contactDetails(f.details)} />
          <p>
            <a className="text-link" href={`mailto:${publicContactEmail}`}>
              {publicContactEmail}
            </a>
          </p>
          {f.phone ? (
            <p>
              <a
                className="text-link"
                href={`tel:${f.phone.replace(/[^+\d]/g, "")}`}
              >
                {f.phone}
              </a>
            </p>
          ) : null}
          <p>
            <Link
              className="text-link"
              href="/public-art/the-hands-of-worcester"
            >
              The Hands of Worcester <span>↗</span>
            </Link>
          </p>
          <p>
            <Link className="text-link" href="/engagement/share-your-hands">
              Share your hands <span>↗</span>
            </Link>
          </p>
          <p>
            <Link className="text-link" href="/paintings-illustrations">
              Paintings & illustrations <span>↗</span>
            </Link>
          </p>
          <p className="form-note">
            Please avoid including sensitive personal information. See the{" "}
            <Link href="/privacy">privacy information</Link>.
          </p>
        </aside>
        <EnquiryForm />
      </div>
    </div>
  );
}
