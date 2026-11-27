"use client";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { submitName, submitWork } from "@/app/engagement/actions";
import type { SubmitResult } from "@/lib/hands-submit";

const smallEnough = 900 * 1024;

function isSmallRaster(file: File) {
  return (
    file.size <= smallEnough &&
    (file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp")
  );
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    image.src = url;
  });
}

/** Shrink a phone photo before it is sent, so a large picture does not crash the page. */
async function compressArtwork(file: File) {
  if (isSmallRaster(file)) return file;
  let source: CanvasImageSource;
  let width = 0;
  let height = 0;
  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      source = bitmap;
      width = bitmap.width;
      height = bitmap.height;
    } else {
      const image = await loadImage(file);
      source = image;
      width = image.naturalWidth;
      height = image.naturalHeight;
    }
  } catch {
    const image = await loadImage(file);
    source = image;
    width = image.naturalWidth;
    height = image.naturalHeight;
  }
  if (!width || !height) throw new Error("unreadable");
  const scale = Math.min(1, 2000 / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("unreadable");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  if ("close" in source && typeof source.close === "function") source.close();
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.85);
  });
  if (!blob) throw new Error("unreadable");
  return new File([blob], "artwork.jpg", { type: "image/jpeg" });
}

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
  const [state, setState] = useState<SubmitResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState(null);
    startTransition(async () => {
      try {
        const image = data.get("image");
        if (image instanceof File && image.size > 0) {
          data.set("image", await compressArtwork(image));
        }
      } catch {
        setState({
          ok: false,
          error:
            "We couldn’t read that picture. Please try a JPG, PNG or WebP photo.",
        });
        return;
      }
      try {
        const result = await submitWork(null, data);
        setState(result);
        if (result.ok) form.reset();
      } catch {
        setState({
          ok: false,
          error:
            "We couldn’t send that just now. Please check your connection and try again.",
        });
      }
    });
  }

  return (
    <form className="share-form" aria-busy={pending} onSubmit={onSubmit}>
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
          JPG, PNG, WebP or phone photo. Large photos are resized automatically.
          Words, a picture, or both.
        </span>
        <input name="image" type="file" accept="image/*" />
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
