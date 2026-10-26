"use client";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { HandsPhoto } from "@/content/hands-photos";

export function HandsGallery({
  images,
  labelledBy,
}: {
  images: HandsPhoto[];
  labelledBy: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const current = index === null ? null : images[index];

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight")
        setIndex((value) =>
          value === null ? value : (value + 1) % images.length,
        );
      if (event.key === "ArrowLeft")
        setIndex((value) =>
          value === null ? value : (value - 1 + images.length) % images.length,
        );
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length]);

  return (
    <>
      <ul className="hands-grid" aria-labelledby={labelledBy}>
        {images.map((image, imageIndex) => (
          <li key={image.src}>
            <figure>
              <button
                type="button"
                className="hands-zoom"
                onClick={() => setIndex(imageIndex)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  loading="lazy"
                  style={{ width: "100%", height: "auto" }}
                />
                <span className="sr-only">Enlarge this photograph</span>
              </button>
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="lightbox-bar">
            <p id={titleId}>{current.caption}</p>
            <div>
              <button
                type="button"
                onClick={() =>
                  setIndex(
                    (value) => (value! - 1 + images.length) % images.length,
                  )
                }
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setIndex((value) => (value! + 1) % images.length)
                }
              >
                Next
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setIndex(null)}
              >
                Close
              </button>
            </div>
          </div>
          <Image
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            sizes="100vw"
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      )}
    </>
  );
}
