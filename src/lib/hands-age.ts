/** Age bands accepted on new Share your hands submissions. */
export const ageRanges = [
  "",
  "under-18",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65-74",
  "75-84",
  "85-89",
  "90-plus",
] as const;

export type AgeRange = (typeof ageRanges)[number];

export const ageRangeOptions: { value: AgeRange; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "under-18", label: "Under 18" },
  { value: "18-24", label: "18 to 24" },
  { value: "25-34", label: "25 to 34" },
  { value: "35-44", label: "35 to 44" },
  { value: "45-54", label: "45 to 54" },
  { value: "55-64", label: "55 to 64" },
  { value: "65-74", label: "65 to 74" },
  { value: "75-84", label: "75 to 84" },
  { value: "85-89", label: "85 to 89" },
  { value: "90-plus", label: "90 or over" },
];

/** Labels for values already stored, including the earlier short list. */
const ageRangeLabels: Record<string, string> = {
  "": "Prefer not to say",
  "prefer-not": "Prefer not to say",
  "under-16": "Under 16",
  "16-17": "16 or 17",
  "18-over": "18 or over",
  "under-18": "Under 18",
  "18-24": "18 to 24",
  "25-34": "25 to 34",
  "35-44": "35 to 44",
  "45-54": "45 to 54",
  "55-64": "55 to 64",
  "65-74": "65 to 74",
  "75-84": "75 to 84",
  "85-89": "85 to 89",
  "90-plus": "90 or over",
};

export function ageRangeLabel(value: string) {
  return ageRangeLabels[value] || value || "Prefer not to say";
}

/** Under 18, including answers saved on the earlier under-16 and 16–17 options. */
export function isUnder18(value: string) {
  return value === "under-18" || value === "under-16" || value === "16-17";
}
