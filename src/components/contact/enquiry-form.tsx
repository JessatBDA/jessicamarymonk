"use client";
import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { submitEnquiry } from "@/app/contact/actions";
import { contactTopics, type ContactResult } from "@/lib/contact-public";

function focusStatus(node: HTMLParagraphElement | null) {
  node?.focus();
}

function Status({ state }: { state: ContactResult | null }) {
  if (!state) return null;
  if (state.ok)
    return (
      <p
        key={state.message}
        className="form-success"
        role="status"
        tabIndex={-1}
        ref={focusStatus}
      >
        {state.message}
      </p>
    );
  return (
    <p key={state.error} className="form-error" role="alert" tabIndex={-1} ref={focusStatus}>
      {state.error}
    </p>
  );
}

function stampOpened(node: HTMLInputElement | null) {
  if (!node || node.dataset.stamped) return;
  node.dataset.stamped = "1";
  if (!node.value) node.value = String(Date.now());
  const opened = node.value;
  node.form?.addEventListener("reset", () => {
    queueMicrotask(() => {
      node.value = opened;
    });
  });
}

function keepConsent(node: HTMLInputElement | null) {
  if (!node || node.dataset.kept) return;
  node.dataset.kept = "1";
  node.form?.addEventListener("reset", () => {
    const checked = node.checked;
    queueMicrotask(() => {
      node.checked = checked;
    });
  });
}

export function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, null);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  function update(field: "name" | "email" | "topic" | "message", value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  if (state?.ok) {
    return (
      <div className="share-form contact-form">
        <Status state={state} />
      </div>
    );
  }

  return (
    <form className="share-form contact-form" action={action}>
      <Status state={state} />
      <div className="hp" aria-hidden="true">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="started_at" ref={stampOpened} />
      <label>
        Your name
        <input
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          value={draft.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          inputMode="email"
          value={draft.email}
          onChange={(event) => update("email", event.target.value)}
        />
      </label>
      <label>
        Topic
        <span className="muted"> Optional.</span>
        <select
          name="topic"
          value={draft.topic}
          onChange={(event) => update("topic", event.target.value)}
        >
          {contactTopics.map((topic) => (
            <option key={topic.value || "unset"} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          required
          maxLength={5000}
          rows={6}
          value={draft.message}
          onChange={(event) => update("message", event.target.value)}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="privacy_consent"
          value="yes"
          required
          aria-describedby="privacy-consent-note"
          ref={keepConsent}
        />
        <span>
          I&apos;m happy for Jessica to use these details to reply to my enquiry.
        </span>
      </label>
      <p className="form-note" id="privacy-consent-note">
        Read the <Link href="/privacy">privacy notice</Link> before you send
        this. Please don’t add anything you would not want kept in order to
        reply.
      </p>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send my message"}
      </button>
    </form>
  );
}
