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
  return (
    <figure className="content-photo">
      <div className={`photo-frame ${shape}`}>
        <Image
          src={`/media/${image.id}`}
          alt={image.alt}
          fill
          unoptimized
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
