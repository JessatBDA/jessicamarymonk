"use client";
import Link from "next/link";
import { useActionState } from "react";
import {
  submitName,
  submitResponse,
  submitWork,
} from "@/app/engagement/actions";
import { ageRangeOptions } from "@/lib/hands-age";
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

function NameFields({ underSixteenNote }: { underSixteenNote: string }) {
  return (
    <>
      <label>
        Name
        <span className="muted"> Optional. A first name is enough.</span>
        <input name="display_name" maxLength={80} autoComplete="name" />
      </label>
      <label className="check">
        <input type="checkbox" name="name_display_consent" value="yes" />
        <span>
          I give permission for my name to appear on the Hands of Worcester
          website. {underSixteenNote}
        </span>
      </label>
    </>
  );
}

function ShareConsent() {
  return (
    <label className="check">
      <input type="checkbox" name="share_consent" value="yes" required />
      <span>
        I agree that this may be shared on the website or in project reporting,
        and that it is my own work. If I am under 18, a parent or teacher has
        agreed.
      </span>
    </label>
  );
}

const guardian =
  "If the person is under 18, a parent or teacher gives this permission for them.";

function AgeRangeField() {
  return (
    <label>
      Age range
      <select name="age_range" defaultValue="">
        {ageRangeOptions.map((option) => (
          <option key={option.value || "unset"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ResponseForm() {
  const [state, action, pending] = useActionState(submitResponse, null);
  return (
    <form className="share-form" action={action}>
      <h2>A few questions</h2>
      <p>There are no wrong answers. Please don’t add phone numbers, email addresses or home addresses.</p>
      <Status state={state} />
      <Honeypot />
      <label>
        What do hands mean, or make you feel?
        <textarea name="hands_mean" required maxLength={2000} rows={4} />
      </label>
      <label>
        How do you use your hands, in work, play, caring or creating?
        <textarea name="hands_use" required maxLength={2000} rows={4} />
      </label>
      <label>
        What did the piece make you feel?
        <textarea name="piece_feel" required maxLength={2000} rows={4} />
      </label>
      <NameFields underSixteenNote={guardian} />
      <AgeRangeField />
      <label className="check">
        <input type="checkbox" name="is_school_or_group" value="yes" />
        <span>This is from a school or a group</span>
      </label>
      <label>
        School or group name
        <span className="muted"> Optional.</span>
        <input name="group_name" maxLength={120} />
      </label>
      <ShareConsent />
      <p className="form-note">
        Read the <Link href="/privacy">privacy information</Link> before you
        send this. Send your feedback, artwork and questions in to the artist.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send my answers"}
      </button>
    </form>
  );
}

export function WorkForm() {
  const [state, action, pending] = useActionState(submitWork, null);
  return (
    <form className="share-form" action={action}>
      <h2>Send a picture, a poem or some writing</h2>
      <p>
        This can be a drawing, a photograph, a poem or other writing about the
        work. Please don’t put phone numbers, email addresses or home addresses
        in the picture or the words.
      </p>
      <Status state={state} />
      <Honeypot />
      <label>
        Title
        <input name="title" required maxLength={160} />
      </label>
      <label>
        Credit
        <span className="muted"> Optional. A first name is enough.</span>
        <input name="credit" maxLength={120} />
      </label>
      <label>
        Poem or other writing
        <textarea name="writing" maxLength={8000} rows={6} />
      </label>
      <label>
        Picture
        <span className="muted"> JPG, PNG or WebP, under 3 MB.</span>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>
      <NameFields underSixteenNote={guardian} />
      <AgeRangeField />
      <label className="check">
        <input type="checkbox" name="is_school_or_group" value="yes" />
        <span>This is from a school or a group</span>
      </label>
      <label>
        School or group name
        <span className="muted"> Optional.</span>
        <input name="group_name" maxLength={120} />
      </label>
      <ShareConsent />
      <p className="form-note">
        Read the <Link href="/privacy">privacy information</Link>. Send your
        feedback, artwork and questions in to the artist.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send my work"}
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
