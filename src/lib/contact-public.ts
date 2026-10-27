/** Public address. Not a secret. */
export const publicContactEmail = "info@jessicamarymonk.com";

export const contactTopicValues = [
  "",
  "public-art",
  "exhibition",
  "community",
  "painting",
  "illustration",
  "general",
] as const;

export const contactTopics: { value: (typeof contactTopicValues)[number]; label: string }[] = [
  { value: "", label: "Choose a topic (optional)" },
  { value: "public-art", label: "Public art" },
  { value: "exhibition", label: "Exhibition" },
  { value: "community", label: "Community project" },
  { value: "painting", label: "Painting" },
  { value: "illustration", label: "Illustration" },
  { value: "general", label: "General enquiry" },
];

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export function contactTopicLabel(value: string) {
  return contactTopics.find((topic) => topic.value === value)?.label || "No topic chosen";
}
