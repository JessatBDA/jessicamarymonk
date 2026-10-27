"use client";
import { useEffect, useRef, useState } from "react";
import { ArtworkImage } from "./content-render";
import { ImagePlaceholder } from "./visuals";
import { categories, type ContentImage, type Entry } from "@/lib/content-model";

const filters = [
  "All work",
  "Paintings",
  "Illustrations",
  "Hands",
  "Portraits",
  "Studies",
  "In the studio",
];

function primaryImage(artwork: Entry) {
  return (
    artwork.body.images.find((image) => image.role === "hero") ||
    artwork.body.images.find((image) => image.role !== "behind") ||
    artwork.body.images[0]
  );
}

function isStudio(artwork: Entry) {
  return primaryImage(artwork)?.role === "behind";
}

export function Gallery({ artworks = [] }: { artworks?: Entry[] }) {
  const [selected, setSelected] = useState("All work");
  const [open, setOpen] = useState<ContentImage | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const finished = artworks.filter((artwork) => !isStudio(artwork));
  const studio = artworks.filter(isStudio);
  const match = (artwork: Entry) => {
    const series = artwork.body.fields.series;
    const category = artwork.body.fields.category;
    if (selected === "Paintings") return category === "Paintings";
    if (selected === "Illustrations") return category === "Illustrations";
    if (selected === "Hands") return series === "Hands";
    if (selected === "Portraits") return series === "Portraits";
    if (selected === "Studies") return series === "Study";
    if (selected === "In the studio") return isStudio(artwork);
    return true;
  };
  const visibleFinished =
    selected === "In the studio" ? [] : finished.filter(match);
  const visibleStudio =
    selected === "All work" || selected === "In the studio"
      ? studio
      : selected === "Paintings"
        ? studio.filter((artwork) => artwork.body.fields.category === "Paintings")
        : [];
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  const placeholders = selected === "All work" ? categories : [selected];
  return (
    <>
      <div
        className="filters"
        role="group"
        aria-label="Filter artwork"
      >
        {filters.map((filter) => (
          <button
            aria-pressed={selected === filter}
            key={filter}
            onClick={() => setSelected(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      {!artworks.length ? (
        <p className="notice">
          Portfolio in preparation. Original artwork photographs and details
          will be added here.
        </p>
      ) : null}
      <div className="portfolio-grid" aria-live="polite">
        {!artworks.length
          ? placeholders.map((category, i) => (
              <figure key={category}>
                <ImagePlaceholder
                  label={category}
                  shape={i % 3 === 1 ? "portrait" : "square"}
                />
              </figure>
            ))
          : visibleFinished.map((artwork) => {
              const image = primaryImage(artwork);
              return image ? (
                <a
                  key={artwork.slug}
                  className="studio-shot"
                  href={`/paintings-illustrations/${artwork.slug}`}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    )
                      return;
                    event.preventDefault();
                    setOpen(image);
                  }}
                >
                  <ArtworkImage
                    image={image}
                    sizes="(max-width: 760px) 46vw, (max-width: 1100px) 30vw, 360px"
                  />
                  {image.caption ? (
                    <span className="studio-caption">{image.caption}</span>
                  ) : null}
                </a>
              ) : null;
            })}
      </div>
      {artworks.length > 0 &&
      !visibleFinished.length &&
      !visibleStudio.length ? (
        <p>No published work in this group yet.</p>
      ) : null}
      {visibleStudio.length ? (
        <section className="studio-group">
          <p className="eyebrow">In the studio</p>
          <div className="portfolio-grid">
            {visibleStudio.map((artwork) => {
              const image = primaryImage(artwork);
              return image ? (
                <a
                  key={artwork.slug}
                  className="studio-shot"
                  href={`/paintings-illustrations/${artwork.slug}`}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    )
                      return;
                    event.preventDefault();
                    setOpen(image);
                  }}
                >
                  <ArtworkImage
                    image={image}
                    sizes="(max-width: 760px) 46vw, (max-width: 1100px) 30vw, 360px"
                  />
                  {image.caption ? (
                    <span className="studio-caption">{image.caption}</span>
                  ) : null}
                </a>
              ) : null;
            })}
          </div>
        </section>
      ) : null}
      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label="Expanded studio image"
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button
          type="button"
          className="lightbox-close"
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
        {open ? (
          <>
            <ArtworkImage
              image={open}
              presentation="viewer"
              priority
              sizes="(max-width: 760px) 92vw, 80vw"
            />
            {open.caption ? (
              <p className="studio-caption">{open.caption}</p>
            ) : null}
          </>
        ) : null}
      </dialog>
    </>
  );
}
