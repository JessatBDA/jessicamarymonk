"use client";
import Link from "next/link";
import { useState } from "react";
import { ImagePlaceholder } from "./visuals";
import { ContentPhoto } from "./content-render";
import { categories, type Entry } from "@/lib/content-model";
export function Gallery({ artworks = [] }: { artworks?: Entry[] }) {
  const [selected, setSelected] = useState("All work");
  const visible =
    selected === "All work"
      ? artworks
      : artworks.filter((artwork) => artwork.body.fields.category === selected);
  const placeholders = selected === "All work" ? categories : [selected];
  return (
    <>
      <div
        className="filters"
        role="group"
        aria-label="Filter artwork by category"
      >
        {["All work", ...categories].map((category) => (
          <button
            aria-pressed={selected === category}
            key={category}
            onClick={() => setSelected(category)}
          >
            {category}
          </button>
        ))}
      </div>
      {!artworks.length && (
        <p className="notice">
          Portfolio in preparation. Original artwork photographs and details
          will be added here.
        </p>
      )}
      <div className="portfolio-grid" aria-live="polite">
        {!artworks.length
          ? placeholders.map((category, i) => (
              <figure key={category}>
                <ImagePlaceholder
                  label={category}
                  shape={i % 3 === 1 ? "portrait" : "square"}
                />
                <figcaption>
                  {category}
                  <span>Artwork to be supplied</span>
                </figcaption>
              </figure>
            ))
          : visible.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/paintings-illustrations/${artwork.slug}`}
              >
                <ContentPhoto
                  image={
                    artwork.body.images.find(
                      (image) => image.role === "hero",
                    ) || artwork.body.images[0]
                  }
                  label={artwork.title}
                  shape="square"
                />
                <div className="artwork-caption">
                  {artwork.title}
                  <span>{artwork.body.fields.medium}</span>
                </div>
              </Link>
            ))}
      </div>
      {artworks.length > 0 && !visible.length && (
        <p>No published work in this category yet.</p>
      )}
    </>
  );
}
