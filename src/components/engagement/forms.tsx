"use client";
import Link from "next/link";
import { useActionState } from "react";
import { submitName, submitWork } from "@/app/engagement/actions";
import type { SubmitResult } from "@/lib/hands-submit";

function Status({ state }: { state: SubmitResult | null }) {
  if (!state) return null;
  if (state.ok)
    return (
      <p className="form-success" role="status">
        {state.message}
      </p>
    );
  return (
    <p className="form-error" role="alert">
      {state.error}
    </p>
  );
}

function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        Company website
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

const guardian =
  "If the person is under 18, a parent or teacher gives this permission for them.";

export function FeedbackForm() {
  const [state, action, pending] = useActionState(submitWork, null);
  return (
    <form className="share-form" action={action}>
      <Status state={state} />
      <Honeypot />
      <label>
        Feedback and Thoughts
        <textarea name="feedback" maxLength={8000} rows={8} />
      </label>
      <label>
        Attachments - share your art here
        <span className="muted">
          {" "}
          JPG, PNG or WebP, under 3 MB. Words, a picture, or both.
        </span>
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        />
      </label>
      <label>
        Your name (optional)
        <input name="display_name" maxLength={80} autoComplete="name" />
      </label>
      <label className="check">
        <input type="checkbox" name="share_consent" value="yes" />
        <span>
          I agree that my feedback or artwork may be shared on this website and
          confirm any artwork is my own.
        </span>
      </label>
      <p className="form-note">
        Read the <Link href="/privacy">privacy information</Link>. Nothing is
        shown on the website until Jessica approves it.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}

export function NameForm() {
  const [state, action, pending] = useActionState(submitName, null);
  return (
    <form className="share-form" action={action}>
      <Status state={state} />
      <Honeypot />
      <label>
        Name
        <input name="display_name" required maxLength={80} autoComplete="name" />
      </label>
      <label>
        Town, school or group
        <span className="muted"> Optional.</span>
        <input name="place" maxLength={120} />
      </label>
      <label>
        Did you take part in a workshop?
        <select name="took_part" defaultValue="">
          <option value="">Skip this</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="prefer-not">Prefer not to say</option>
        </select>
      </label>
      <label className="check">
        <input type="checkbox" name="name_display_consent" value="yes" />
        <span>
          I give permission for my name to appear on the Hands of Worcester
          website. {guardian}
        </span>
      </label>
      <p className="form-note">
        By sending this, you agree it can be stored so Jessica can review it.
        The name is only shown on the website if you tick the box above and she
        approves it. Please don’t add phone numbers, email addresses or home
        addresses. Read the <Link href="/privacy">privacy information</Link>.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send my name"}
      </button>
    </form>
  );
}
