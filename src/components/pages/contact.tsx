import { EnquiryForm } from "@/components/contact/enquiry-form";
import { Brushstroke } from "@/components/visuals";
import { Lines, RichText } from "@/components/content-render";
import { publicContactEmail } from "@/lib/contact-public";
import type { Entry } from "@/lib/content-model";

const retiredDetails =
  "The enquiry form is being prepared. Contact details will appear here when supplied.";

const readyDetails =
  "Write about public art, community projects, paintings and illustration. You can use the form, or send an email.";

export function ContactView({ entry }: { entry: Entry }) {
  const f = entry.body.fields;
  const details = !f.details?.trim() || f.details.trim() === retiredDetails
    ? readyDetails
    : f.details;
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
          <RichText text={details} />
          <p>
            <a className="text-link" href={`mailto:${publicContactEmail}`}>
              {publicContactEmail}
            </a>
          </p>
          {f.phone ? (
            <p>
              <a href={`tel:${f.phone.replace(/[^+\d]/g, "")}`}>{f.phone}</a>
            </p>
          ) : null}
        </aside>
        <EnquiryForm />
      </div>
    </div>
  );
}
