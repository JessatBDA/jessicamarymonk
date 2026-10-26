import { z } from "zod";

export const imageSchema = z.object({
  id: z.uuid(),
  alt: z.string().trim().min(1).max(300),
  caption: z.string().max(500),
  role: z.enum([
    "hero",
    "gallery",
    "behind",
    "finished",
    "portrait",
    "painting",
    "illustration",
  ]),
});
export const bodySchema = z.object({
  fields: z.record(z.string().max(80), z.string().max(50000)),
  images: z.array(imageSchema).max(30),
  featured: z.boolean().default(false),
});
export const saveSchema = z.object({
  id: z.uuid(),
  revision: z.number().int().min(0),
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  sort_order: z.number().int().min(0).max(9999),
  body: bodySchema,
  publish: z.boolean(),
});
export type ContentBody = z.infer<typeof bodySchema>;
export type ContentImage = z.infer<typeof imageSchema> & {
  /** Public path for a photograph shipped in the repository. CMS uploads omit this. */
  src?: string;
  width?: number;
  height?: number;
};
export type EntryKind = "page" | "project" | "artwork";
export type Entry = {
  id: string;
  kind: EntryKind;
  slug: string;
  title: string;
  body: ContentBody;
  sort_order: number;
  revision: number;
  updated_at: string;
  published_at?: string;
};
export type Field = {
  key: string;
  label: string;
  rich?: boolean;
  options?: string[];
};
export const categories = [
  "Paintings",
  "Portraits",
  "Drawings",
  "Book illustration",
  "Theatre artwork",
  "Other creative projects",
];
const seoFields: Field[] = [
  { key: "seo_title", label: "Search engine title" },
  { key: "seo_description", label: "Search engine description" },
];
export function fieldsFor(kind: EntryKind, slug: string): Field[] {
  if (kind === "project")
    return [
      ["heading", "Display heading (optional line breaks)"],
      ["location", "Location"],
      ["year", "Year"],
      ["commissioner", "Commissioning organisation"],
      ["status", "Project status"],
      ["intro", "Introduction"],
      ["summary_heading", "Introduction heading"],
      ["summary", "Project description", true],
      ["notice", "Optional information notice"],
      ["concept_heading", "Artistic concept heading"],
      ["concept", "Artistic concept", true],
      ["community_heading", "Community section heading"],
      ["community", "Community participation", true],
      ["making_heading", "Making section heading"],
      ["making", "Making, materials and techniques", true],
      ["outcomes", "Project outcomes", true],
      ["exhibition", "Exhibition and visitor information", true],
      ["artist_statement", "Artist’s words", true],
      ["funding", "Funding acknowledgement", true],
      ["video", "Video link (https://)"],
      ["links", "Related links (one https:// URL per line)"],
    ]
      .map<Field>(([key, label, rich]) => ({
        key: String(key),
        label: String(label),
        rich: !!rich,
      }))
      .concat(seoFields);
  if (kind === "artwork")
    return [
      { key: "category", label: "Category", options: categories },
      ...[
        ["description", "Description", true],
        ["year", "Year"],
        ["medium", "Medium"],
        ["dimensions", "Dimensions"],
        ["availability", "Availability"],
        ["commission", "Commission information", true],
      ].map<Field>(([key, label, rich]) => ({
        key: String(key),
        label: String(label),
        rich: !!rich,
      })),
      ...seoFields,
    ];
  if (slug === "home")
    return [
      ["eyebrow", "Opening line"],
      ["heading", "Main heading"],
      ["subtitle", "Artist subtitle"],
      ["intro", "Introduction"],
      ["feature_label", "Featured project label"],
      ["feature_slug", "Featured project URL name"],
      [
        "feature_heading",
        "Featured project heading (leave blank to use project title)",
      ],
      ["feature_index", "Featured project footer label"],
      ["studio_label", "Studio section label"],
      ["studio_heading", "Studio section heading"],
      ["painting_caption", "Painting caption"],
      ["illustration_caption", "Illustration caption"],
      ["practice_label", "Artist section label"],
      ["practice_heading", "Artist section heading"],
      ["practice_text", "Artist introduction", true],
      ["invitation_label", "Commission section label"],
      ["invitation_heading", "Commission section heading"],
      ["invitation_text", "Commission section text"],
    ]
      .map<Field>(([key, label, rich]) => ({
        key: String(key),
        label: String(label),
        rich: !!rich,
      }))
      .concat(seoFields);
  if (slug === "about")
    return [
      ["eyebrow", "Opening line"],
      ["heading", "Page heading"],
      ["name", "Artist name"],
      ["subtitle", "Subtitle"],
      ["intro", "Introduction", true],
      ["background", "Background", true],
      ["notice", "Optional preparation note"],
      ["practice", "Artistic practice", true],
      ["community", "Public art and community engagement", true],
      ["commissions", "Commissions and collaborations", true],
    ]
      .map<Field>(([key, label, rich]) => ({
        key: String(key),
        label: String(label),
        rich: !!rich,
      }))
      .concat(seoFields);
  return [
    { key: "heading", label: "Contact heading" },
    { key: "intro", label: "Contact introduction" },
    { key: "email", label: "Public contact email" },
    { key: "phone", label: "Public phone number" },
    { key: "details", label: "Contact information", rich: true },
    ...seoFields,
  ];
}
export function publicPath(entry: Pick<Entry, "kind" | "slug">) {
  return entry.kind === "page"
    ? entry.slug === "home"
      ? "/"
      : `/${entry.slug}`
    : entry.kind === "project"
      ? `/public-art/${entry.slug}`
      : `/paintings-illustrations/${entry.slug}`;
}
