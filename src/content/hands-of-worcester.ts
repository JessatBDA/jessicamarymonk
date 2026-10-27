import type { ContentImage, Entry } from "@/lib/content-model";
import participants from "./hands-participants.json";
import { handsHero } from "./hands-photos";

export const handsSlug = "the-hands-of-worcester";

export const handsStats = [
  { value: "5 months", label: "youngest participant" },
  { value: "90 years", label: "oldest participant" },
  { value: "74%", label: "right hands" },
  { value: "25", label: "paired hands" },
  { value: "75kg", label: "of cast material used" },
] as const;

export const over200Sentence =
  "Over 200 people have taken part, and more are getting involved all the time.";

export const panelQuote =
  "The human hand is unique to every individual on this earth. From unique fingerprints used to identify us, to hands who hold each other, the human experience is informed by touch. Hands create, they comfort, they tell a story. As a human race we have always had a fascination with hands, from cave paintings dating 40,000 years ago of hand prints, to hands in art; hands gesture and contain our stories, our histories and our emotions. As children are held by their mothers; as we are held by each other.";

export const artistStatement =
  "The Hands of Worcester is a community-led project. I wanted to get out into the community and take a historical cast of the community’s hands at that time. Now it is displayed before you, and I hope you can see the unique and magical quality that I saw when I made each and every cast. A thank you to the project team as a whole and especially to my husband, Guy, who helped and supported the whole process.";

export const fundingText =
  "Supported using public funding by the National Lottery through Arts Council England. With special thanks to The Elmley Foundation.";

export const handsFields: Record<string, string> = {
  heading: "The Hands\nof Worcester.",
  location: "The Worcester Plinth, Worcester",
  status: "On show for 9 months",
  intro:
    "A community-led public art installation by Jessica Mary Monk, made in conjunction with The Worcester Plinth.",
  summary_heading: "The story of\nthe hands.",
  summary:
    "Workshops across Worcester earlier this year collected plaster casts of people’s hands. The casts were painted, sealed in resin and mounted, and sit atop The Worcester Plinth, a plinth that moves from location to location within Worcester, for 9 months.",
  notice: "",
  concept_heading: "From the exhibition panel",
  concept: panelQuote,
  artist_statement: artistStatement,
  community_heading: "Made with the community",
  community:
    "The youngest participant was 5 months old and the oldest was 90. Thank you to every participant.",
  making_heading: "From hand to cast",
  making:
    "Plaster casts were taken in workshops across Worcester, then painted, sealed in resin and mounted on the plinth. Jessica also made charcoal and acrylic studies of hands alongside the installation. Some of those studies are on the paintings and illustrations page.",
  exhibition:
    "The hands sit on The Worcester Plinth for 9 months. The plinth moves from location to location within Worcester.",
  funding: fundingText,
  seo_title: "The Hands of Worcester",
  seo_description:
    "Community-led public art by Jessica Mary Monk with The Worcester Plinth, on show for 9 months.",
};

/** Earlier published sentences. A custom edit that differs from these is kept. */
const retiredCopy = new Set([
  "A community-led public art installation by Jessica Mary Monk, made in conjunction with The Worcester Plinth. Over 200 people have taken part, and more are getting involved all the time.",
  "A community-led public art installation by Jessica Mary Monk, made in conjunction with The Worcester Plinth. 211 people took part.",
  "211 people took part. The youngest participant was 5 months old and the oldest was 90. Thank you to every participant.",
  "Community-led public art by Jessica Mary Monk with The Worcester Plinth: plaster casts of 211 participants’ hands, on show for 9 months.",
  "211 people took part. Community-led public art by Jessica Mary Monk with The Worcester Plinth, on show for 9 months. The names shown are those who agreed to be shown.",
  "The Hands of Worcester is a community led project, I wanted to get out into the community and take a historical cast of the communities hands at that time. Now it is displayed before you, I hope you can see the unique and magical quality as I did when I made each and every cast. A thank you to the project team as a whole and especially to my husband, Guy, who helped and supported the whole process.",
  "Supported using public funding by the National Lottery through Arts Council England. With thanks to funders and supporters, including The Elmley Foundation.",
  "Plaster casts were taken in workshops across Worcester, then painted, sealed in resin and mounted on the plinth. Jessica also made charcoal and acrylic studies of hands alongside the installation. Photographs of those studies have not been added yet.",
]);

const placeholderMarkers = [
  "awaiting confirmation",
  "will be added",
  "to be supplied",
  "in preparation",
  "being prepared",
  "artist-approved text",
];

function isPlaceholder(value: string) {
  const normalised = value.trim().toLowerCase();
  return (
    normalised ===
      "a community art installation associated with the worcester plinth." ||
    placeholderMarkers.some((marker) => normalised.includes(marker))
  );
}

export const handsHeroImage: ContentImage = {
  id: "a1000000-0000-4000-8000-000000000002",
  alt: handsHero.alt,
  caption: handsHero.caption,
  role: "hero",
  src: handsHero.src,
  width: handsHero.width,
  height: handsHero.height,
};

/** Panel order, left column then right column. The public page sorts A–Z. */
export function panelNames() {
  return participants.columns.flat();
}

export function withHandsPresentation(entry: Entry): Entry {
  if (entry.slug !== handsSlug) return entry;
  const fields = { ...handsFields };
  for (const [key, value] of Object.entries(entry.body.fields)) {
    const text = value.trim();
    if (value && !isPlaceholder(value) && !text.includes("211") && !retiredCopy.has(text))
      fields[key] = value;
  }
  const images = entry.body.images.length
    ? entry.body.images
    : [handsHeroImage];
  return {
    ...entry,
    body: { ...entry.body, fields, images, featured: entry.body.featured },
  };
}
