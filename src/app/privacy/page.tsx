import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy information",
  "Privacy information for the Jessica Mary Monk website development preview.",
  "/privacy",
);
export default function Page() {
  return (
    <article className="wrap prose">
      <p className="eyebrow">Development preview</p>
      <h1>Privacy information.</h1>
      <p>
        This website is in development. Contact and visitor feedback submissions
        are disabled. It does not currently accept orders or payments.
      </p>
      <h2>Before public forms open</h2>
      <p>
        A complete privacy notice must identify the data controller and contact
        details, purposes and lawful bases, service providers, retention
        periods, rights and the process for requesting access or deletion.
      </p>
      <h2>Visitor feedback</h2>
      <p>
        The planned questionnaires will not require a name or email address.
        Permission to publish an anonymised quotation will be optional and
        separate from submitting feedback. Individual responses will not be
        public.
      </p>
      <h2>Cookies and analytics</h2>
      <p>
        No analytics or marketing scripts have been added to this preview.
        Administrator authentication will be configured separately.
      </p>
    </article>
  );
}
