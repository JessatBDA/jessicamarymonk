import Link from "next/link";
import { questions, pageMetadata } from "@/lib/site";
export const metadata = {
  ...pageMetadata(
    "Visitor questionnaire preview",
    "Preview of the planned visitor questionnaire for The Hands of Worcester.",
    "/engagement/the-hands-of-worcester",
  ),
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="wrap questionnaire">
      <section className="page-intro">
        <Link className="back-link" href="/public-art/the-hands-of-worcester">
          ← Back to the project
        </Link>
        <p className="eyebrow">Public engagement · Questionnaire preview</p>
        <h1>
          Your experience
          <br />
          of the hands.
        </h1>
        <p>The Hands of Worcester</p>
      </section>
      <div className="notice" id="survey-status">
        <strong>This questionnaire is not open yet.</strong>
        <p>
          This is a preview of the planned questions. Responses cannot be
          submitted or saved. Names and email addresses will not be required.
        </p>
      </div>
      <form aria-describedby="survey-status">
        <fieldset disabled>
          <legend className="sr-only">Visitor questionnaire preview</legend>
          {questions.map((q, i) => (
            <fieldset className="question" key={q.title}>
              <legend>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {q.title}
              </legend>
              {q.options ? (
                q.options.map((option) => (
                  <label className="radio-label" key={option}>
                    <input type="radio" name={`question-${i}`} value={option} />
                    {option}
                  </label>
                ))
              ) : (
                <textarea rows={4} aria-label={q.title} maxLength={3000} />
              )}
            </fieldset>
          ))}
          <label className="radio-label consent">
            <input type="checkbox" name="quoteConsent" />I give optional
            permission for an anonymised quotation from my feedback to be
            published. This is not required to submit feedback.
          </label>
          <button className="button" type="submit">
            Questionnaire opening soon
          </button>
        </fieldset>
      </form>
      <p className="form-note">
        Before collection opens, this page will explain the purpose of
        collection, retention period and how to request deletion. Individual
        responses will be private.{" "}
        <Link href="/privacy">Privacy information</Link>.
      </p>
    </div>
  );
}
