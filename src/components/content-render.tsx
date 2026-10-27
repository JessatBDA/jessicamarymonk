import Image from "next/image";
import { Fragment } from "react";
import Markdown from "react-markdown";
import { ImagePlaceholder } from "./visuals";
import type { ContentImage } from "@/lib/content-model";
import { studioImages } from "@/lib/studio-images";
export function RichText({ text }: { text?: string }) {
  return text ? (
    <div className="rich-content">
      <Markdown
        allowedElements={[
          "p",
          "strong",
          "em",
          "ul",
          "ol",
          "li",
          "h3",
          "h4",
          "blockquote",
          "a",
          "br",
        ]}
        unwrapDisallowed
      >
        {text}
      </Markdown>
    </div>
  ) : null;
}
export function ArtworkImage({
  image,
  sizes,
  priority = false,
  presentation = "grid",
}: {
  image: ContentImage;
  sizes: string;
  priority?: boolean;
  presentation?: "grid" | "viewer";
}) {
  const local = image.file ? studioImages[image.file] : undefined;
  const className =
    presentation === "viewer" ? "artwork-viewer" : "artwork-grid-image";
  const style =
    presentation === "viewer"
      ? {
          width: "auto" as const,
          height: "auto" as const,
          maxWidth: "100%",
          maxHeight: "86vh",
        }
      : { width: "100%", height: "auto" as const };
  if (local) {
    return (
      <Image
        src={local}
        alt={image.alt}
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }
  return (
    <Image
      src={`/media/${image.id}`}
      alt={image.alt}
      width={1600}
      height={1200}
      unoptimized
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  );
}
export function ContentPhoto({
  image,
  label,
  shape = "landscape",
  number,
  priority = false,
  sizes = "(max-width: 760px) 92vw, 60vw",
}: {
  image?: ContentImage;
  label: string;
  shape?: "portrait" | "landscape" | "square";
  number?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!image)
    return <ImagePlaceholder label={label} shape={shape} number={number} />;
  const src = image.src || `/media/${image.id}`;
  return (
    <figure className="content-photo">
      <div
        className={`photo-frame ${shape}`}
        style={
          image.width && image.height
            ? { aspectRatio: `${image.width} / ${image.height}` }
            : undefined
        }
      >
        <Image
          src={src}
          alt={image.alt}
          fill
          priority={priority}
          unoptimized={!image.src}
          sizes={sizes}
        />
      </div>
      {image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  );
}
export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
