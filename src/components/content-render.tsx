import Image from "next/image";
import { Fragment } from "react";
import Markdown from "react-markdown";
import { ImagePlaceholder } from "./visuals";
import type { ContentImage } from "@/lib/content-model";
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
export function ContentPhoto({
  image,
  label,
  shape = "landscape",
  number,
}: {
  image?: ContentImage;
  label: string;
  shape?: "portrait" | "landscape" | "square";
  number?: string;
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
          unoptimized={!image.src}
          sizes="(max-width: 760px) 100vw, 60vw"
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
