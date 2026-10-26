/** Artist-supplied lead line. Use verbatim. */
export const artistTagline =
  "A British artist working across public art, painting and illustration, with community at the heart of her pieces.";

const retiredHomeIntro =
  "A British artist working across public art, painting and illustration, with community installations at the heart of this website.";

const retiredAboutIntro =
  "Jessica Mary Monk is a British public artist, painter and illustrator.";

const retiredAboutBackground =
  "Her work includes The Hands of Worcester, a community art installation associated with The Worcester Plinth.";

const retiredAboutNotice =
  "A full artist biography, background and account of Jessica’s practice will be added here in her own words.";

const retiredSupplied = "Artist-approved text to be supplied.";

/** Link only. The project page already exists under Public art. */
export const aboutHandsLink =
  "[The Hands of Worcester](/public-art/the-hands-of-worcester)";

export const aboutHandsHref = "/public-art/the-hands-of-worcester";

export const aboutNoticeTodo =
  "TODO: Add the artist’s biography and background here, in her own words.";

export const aboutSectionTodo = "TODO: Artist-approved text to be supplied.";

const retiredDescriptions = [
  "Public artist, painter and illustrator.",
  "About Jessica Mary Monk, British public artist, painter and illustrator.",
  "Explore public art, community installations, painting and illustration by British artist Jessica Mary Monk.",
];

function trimmed(value: string | undefined) {
  return value?.trim() ?? "";
}

/** Published CMS text wins, except known placeholder sentences from the first seed. */
export function homeIntro(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredHomeIntro) return artistTagline;
  return value ?? artistTagline;
}

export function aboutIntro(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredAboutIntro) return artistTagline;
  return value ?? artistTagline;
}

export function aboutBackground(value: string | undefined) {
  const text = trimmed(value);
  if (text === retiredAboutBackground) return aboutHandsLink;
  return text;
}

export function aboutNotice(value: string | undefined) {
  const text = trimmed(value);
  if (text === retiredAboutNotice) return aboutNoticeTodo;
  return text;
}

export function aboutSection(value: string | undefined) {
  const text = trimmed(value);
  if (text === retiredSupplied) return aboutSectionTodo;
  return text;
}

export function metaDescription(value: string | undefined) {
  const text = trimmed(value);
  if (!text || retiredDescriptions.includes(text)) return artistTagline;
  return value ?? artistTagline;
}
