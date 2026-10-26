"use client";
import { useRef, useState } from "react";
import { RichText } from "@/components/content-render";
export function RichEditor({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const input = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  function format(prefix: string, suffix = "") {
    const element = input.current;
    if (!element) return;
    const start = element.selectionStart,
      end = element.selectionEnd;
    onChange(
      value.slice(0, start) +
        prefix +
        (value.slice(start, end) || "Your text") +
        suffix +
        value.slice(end),
    );
    element.focus();
  }
  return (
    <div className="admin-rich">
      <div className="admin-toolbar" role="group" aria-label="Text formatting">
        <button
          type="button"
          onClick={() => format("**", "**")}
          disabled={preview}
        >
          <strong>Bold</strong>
        </button>
        <button
          type="button"
          onClick={() => format("*", "*")}
          disabled={preview}
        >
          <em>Italic</em>
        </button>
        <button
          type="button"
          onClick={() => format("\n### ")}
          disabled={preview}
        >
          Heading
        </button>
        <button type="button" onClick={() => format("\n- ")} disabled={preview}>
          List
        </button>
        <button
          type="button"
          aria-pressed={preview}
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Edit text" : "Formatted preview"}
        </button>
      </div>
      {preview ? (
        <div className="admin-rich-preview">
          <RichText text={value || "Nothing to preview yet."} />
        </div>
      ) : (
        <textarea
          ref={input}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={50000}
          rows={6}
        />
      )}
      <small>Use the toolbar for formatting. HTML is not rendered.</small>
    </div>
  );
}
