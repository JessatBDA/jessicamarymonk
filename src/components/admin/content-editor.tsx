"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  fieldsFor,
  publicPath,
  type Entry,
  type ContentImage,
} from "@/lib/content-model";
import { studioImages } from "@/lib/studio-images";
import { saveEntry, unpublishEntry } from "@/app/admin/content-actions";
import { RichEditor } from "./rich-editor";
export function ContentEditor({
  initial,
  publishedAt,
}: {
  initial: Entry;
  publishedAt: string | null;
}) {
  const [entry, setEntry] = useState(initial),
    [published, setPublished] = useState(publishedAt),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const fields = fieldsFor(entry.kind, entry.slug);
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(patch: Partial<Entry>) {
    setEntry((current) => ({ ...current, ...patch }));
    setDirty(true);
    setMessage("");
  }
  function field(key: string, value: string) {
    update({
      body: { ...entry.body, fields: { ...entry.body.fields, [key]: value } },
    });
  }
  function images(value: ContentImage[]) {
    update({ body: { ...entry.body, images: value } });
  }
  async function save(publish: boolean) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await saveEntry({ ...entry, publish });
      if (!result.ok || !result.entry) {
        setError(result.error || "Unable to save.");
        return;
      }
      setEntry(result.entry);
      setDirty(false);
      if (publish) setPublished(new Date().toISOString());
      setMessage(
        publish
          ? "Published. Your changes are now visible on the public website."
          : "Draft saved. The public website has not changed.",
      );
    } catch {
      setError(
        "Unable to save. Your session may have expired. Sign in again in another tab, then retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    if (
      !confirm(
        "Remove this entry from the public website? Your draft and images will be kept.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const result = await unpublishEntry(entry.id, entry.revision);
      if (!result.ok) {
        setError(result.error || "Unable to unpublish.");
        return;
      }
      setPublished(null);
      setEntry((current) => ({ ...current, revision: current.revision + 1 }));
      setMessage("Unpublished. This entry is now private.");
    } catch {
      setError("Unable to unpublish. Reload and try again.");
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (entry.body.images.length + files.length > 30) {
      setError("Use at most 30 images per entry.");
      return;
    }
    setBusy(true);
    setError("");
    const uploaded: ContentImage[] = [];
    try {
      for (const file of Array.from(files)) {
        if (file.size > 3 * 1024 * 1024)
          throw new Error(`${file.name}: choose a file under 3 MB.`);
        const form = new FormData();
        form.set("file", file);
        form.set("entryId", entry.id);
        setMessage(`Uploading ${file.name}…`);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        uploaded.push({
          ...data.image,
          role:
            entry.kind === "page"
              ? "portrait"
              : entry.body.images.length + uploaded.length === 0
                ? "hero"
                : "gallery",
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (uploaded.length) images([...entry.body.images, ...uploaded]);
      setMessage(
        uploaded.length
          ? `${uploaded.length} image(s) uploaded. Add descriptions, choose their placement, then save.`
          : "",
      );
      setBusy(false);
    }
  }
  function move(index: number, direction: number) {
    const result = [...entry.body.images];
    const other = index + direction;
    if (other < 0 || other >= result.length) return;
    [result[index], result[other]] = [result[other], result[index]];
    images(result);
  }
  function changeImage(index: number, patch: Partial<ContentImage>) {
    images(
      entry.body.images.map((image, i) =>
        i === index ? { ...image, ...patch } : image,
      ),
    );
  }
  const previewUrl = `/admin/preview/${entry.id}`;
  return (
    <>
      <Link href={`/admin/content?kind=${entry.kind}`} className="admin-back">
        ← Back to{" "}
        {entry.kind === "page"
          ? "pages"
          : entry.kind === "project"
            ? "projects"
            : "artwork"}
      </Link>
      <div className="admin-title-row">
        <div>
          <p className="admin-kicker">{entry.kind} editor</p>
          <h1>{entry.title}</h1>
          <p>
            <span className="admin-badge">
              {published ? "Published" : "Draft"}
            </span>{" "}
            {dirty
              ? "Unsaved changes"
              : published && new Date(entry.updated_at) > new Date(published)
                ? "Newer draft saved"
                : "All changes saved"}
          </p>
        </div>
        <div className="admin-actions">
          <Link
            className="admin-button secondary"
            href={previewUrl}
            target="_blank"
          >
            Preview saved draft ↗
          </Link>
          {published && (
            <Link
              className="admin-link"
              href={publicPath(entry)}
              target="_blank"
            >
              View public page ↗
            </Link>
          )}
        </div>
      </div>
      <div className="admin-savebar">
        <div className="admin-actions">
          <button
            className="admin-button secondary"
            disabled={busy}
            onClick={() => save(false)}
          >
            Save draft
          </button>
          <button
            className="admin-button"
            disabled={busy}
            onClick={() => save(true)}
          >
            {busy ? "Working…" : "Publish changes"}
          </button>
          {published && entry.kind !== "page" && (
            <button
              className="admin-button danger"
              disabled={busy}
              onClick={unpublish}
            >
              Unpublish
            </button>
          )}
        </div>
        <span>
          {dirty
            ? "Save before previewing. Publishing also saves your draft."
            : "Preview shows the last saved draft."}
        </span>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-success" role="status">
          {message}
        </p>
      )}
      <fieldset disabled={busy} className="admin-editor-fields">
        <section className="admin-panel">
          <h2>Content details</h2>
          <div className="admin-field-grid">
            <label>
              {entry.kind === "artwork"
                ? "Private reference"
                : "Title"}
              <input
                value={entry.title}
                maxLength={200}
                required={entry.kind !== "artwork"}
                onChange={(event) => update({ title: event.target.value })}
              />
              {entry.kind === "artwork" ? (
                <small>
                  Not shown on the website. Leave blank to keep the URL name.
                  Year, medium and dimensions are optional and stay hidden
                  while empty.
                </small>
              ) : null}
            </label>
            <label>
              URL name
              <input
                value={entry.slug}
                maxLength={120}
                readOnly={entry.kind === "page"}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                onChange={(event) => update({ slug: event.target.value })}
              />
              <small>
                Lowercase letters, numbers and hyphens. Changing a live URL
                changes its address.
              </small>
            </label>
            <label>
              Display order
              <input
                type="number"
                min={0}
                max={9999}
                value={entry.sort_order}
                onChange={(event) =>
                  update({ sort_order: Number(event.target.value) })
                }
              />
            </label>
            {entry.kind !== "page" && (
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={entry.body.featured}
                  onChange={(event) =>
                    update({
                      body: { ...entry.body, featured: event.target.checked },
                    })
                  }
                />
                Feature on the homepage
              </label>
            )}
          </div>
        </section>
        <section className="admin-panel">
          <h2>
            {entry.kind === "page" ? "Page content" : "Story & information"}
          </h2>
          <p className="admin-help">
            Blank optional fields are hidden. Line breaks in headings are
            preserved.
          </p>
          {fields.map((item) => (
            <div className="admin-field" key={item.key}>
              <label htmlFor={`field-${item.key}`}>{item.label}</label>
              {item.rich ? (
                <RichEditor
                  id={`field-${item.key}`}
                  value={entry.body.fields[item.key] || ""}
                  onChange={(value) => field(item.key, value)}
                />
              ) : item.options ? (
                <select
                  id={`field-${item.key}`}
                  value={entry.body.fields[item.key] || ""}
                  onChange={(event) => field(item.key, event.target.value)}
                >
                  <option value="">
                    {item.key === "category" ? "Choose a category" : "Not set"}
                  </option>
                  {item.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <textarea
                  id={`field-${item.key}`}
                  rows={item.key.includes("heading") ? 2 : 3}
                  value={entry.body.fields[item.key] || ""}
                  maxLength={50000}
                  onChange={(event) => field(item.key, event.target.value)}
                />
              )}
            </div>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Images & galleries</h2>
          <p>
            Upload JPG, PNG or WebP files directly from your computer. Up to 30
            images per entry; 3 MB and 40 megapixels per image. Images are
            resized for the web and location metadata is removed.
          </p>
          <label className="admin-upload">
            Choose images
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                void upload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <p className="admin-help">
            Images stay private until published. “Remove from draft” keeps the
            current public image until you publish the new version.
          </p>
          <div className="admin-image-list">
            {entry.body.images.map((image, index) => (
              <div className="admin-image" key={image.id}>
                <div className="admin-thumbnail">
                  <Image
                    src={
                      image.file && studioImages[image.file]
                        ? studioImages[image.file]
                        : `/media/${image.id}`
                    }
                    alt={image.alt || "Uploaded image"}
                    fill
                    unoptimized={!image.file || !studioImages[image.file]}
                    sizes="160px"
                  />
                </div>
                <div>
                  <label>
                    Image description (alternative text)
                    <input
                      required
                      maxLength={300}
                      value={image.alt}
                      onChange={(event) =>
                        changeImage(index, { alt: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Caption
                    <input
                      maxLength={500}
                      value={image.caption}
                      onChange={(event) =>
                        changeImage(index, { caption: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Placement
                    <select
                      value={image.role}
                      onChange={(event) =>
                        changeImage(index, {
                          role: event.target.value as ContentImage["role"],
                        })
                      }
                    >
                      {(entry.kind === "page" && entry.slug === "home"
                        ? ["hero", "portrait", "painting", "illustration", "seascape"]
                        : entry.kind === "page"
                          ? ["portrait", "gallery"]
                          : entry.kind === "project"
                            ? ["hero", "behind", "finished", "gallery"]
                            : ["hero", "gallery"]
                      ).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="admin-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑ Move up
                    </button>
                    <button
                      type="button"
                      disabled={index === entry.body.images.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓ Move down
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        images(entry.body.images.filter((_, i) => i !== index))
                      }
                    >
                      Remove from draft
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </fieldset>
      <div className="admin-actions">
        <button
          className="admin-button secondary"
          disabled={busy}
          onClick={() => save(false)}
        >
          Save draft
        </button>
        <button
          className="admin-button"
          disabled={busy}
          onClick={() => save(true)}
        >
          Publish changes
        </button>
      </div>
    </>
  );
}
