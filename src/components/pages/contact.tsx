import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { Lines, RichText } from "@/components/content-render";
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
          <RichText text={f.details} />
          {f.email && (
            <p>
              <a href={`mailto:${f.email}`}>{f.email}</a>
            </p>
          )}
          {f.phone && (
            <p>
              <a href={`tel:${f.phone.replace(/[^+\d]/g, "")}`}>{f.phone}</a>
            </p>
          )}
          <p className="notice" id="contact-status">
            Preview only. Sending is unavailable until secure enquiry storage
            and spam protection are configured. Information entered here is not
            sent or saved.
          </p>
        </aside>
        <form aria-describedby="contact-status">
          <fieldset disabled>
            <legend className="sr-only">Enquiry form preview</legend>
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength={120} />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </label>
            <label>
              What would you like to discuss?
              <select name="topic">
                <option>Public art commission</option>
                <option>Exhibition</option>
                <option>Community project</option>
                <option>Painting commission</option>
                <option>Illustration commission</option>
                <option>General enquiry</option>
              </select>
            </label>
            <label>
              Your message
              <textarea name="message" rows={6} required maxLength={5000} />
            </label>
            <button className="button" type="submit">
              Enquiries opening soon
            </button>
          </fieldset>
          <p className="form-note">
            Please avoid including sensitive personal information. See the{" "}
            <Link href="/privacy">privacy information</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
