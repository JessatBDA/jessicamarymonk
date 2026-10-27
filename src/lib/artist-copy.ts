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

/** Earlier seed stored only this link. */
const aboutHandsLink =
  "[The Hands of Worcester](/public-art/the-hands-of-worcester)";

const aboutNoticeTodo =
  "TODO: Add the artist’s biography and background here, in her own words.";

const aboutSectionTodo = "TODO: Artist-approved text to be supplied.";

export const aboutBackgroundCopy =
  "Her public work includes [The Hands of Worcester](/public-art/the-hands-of-worcester), a community-led installation made with The Worcester Plinth.";

export const aboutPracticeCopy =
  "Jessica paints in acrylic and draws in charcoal, chalk and pastel. The pictures in the studio gallery are details of the work. They are shown without titles or years.";

export const aboutCommunityCopy =
  "The Hands of Worcester was made with people in Worcester and with The Worcester Plinth. Workshops collected plaster casts of hands. The casts were painted, sealed in resin and mounted on the plinth. The project was supported using public funding by the National Lottery through Arts Council England, with thanks to The Elmley Foundation.";

export const aboutCommissionsCopy =
  "Enquiries are welcome for public art, community projects, paintings and illustration.";

const aboutSections = {
  practice: aboutPracticeCopy,
  community: aboutCommunityCopy,
  commissions: aboutCommissionsCopy,
} as const;

export const contactDetailsCopy =
  "Jessica welcomes enquiries about public art, community projects, paintings and illustration. Messages cannot be sent from this page yet.";

const retiredContactDetails =
  "The enquiry form is being prepared. Contact details will appear here when supplied.";

export const homePracticeHeading = "Public artist,\npainter and illustrator.";

export const homePracticeText =
  "Public art with The Worcester Plinth, acrylic paintings, and drawings in charcoal, chalk and pastel. The studio pictures are details of the work, shown without titles or years.";

export const homeInvitationHeading = "Enquiries are welcome.";

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
  if (!text || text === retiredAboutBackground || text === aboutHandsLink)
    return aboutBackgroundCopy;
  return text;
}

export function aboutNotice(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredAboutNotice || text === aboutNoticeTodo)
    return "";
  return text;
}

export function aboutSection(
  key: keyof typeof aboutSections,
  value: string | undefined,
) {
  const text = trimmed(value);
  if (!text || text === retiredSupplied || text === aboutSectionTodo)
    return aboutSections[key];
  return text;
}

export function contactDetails(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredContactDetails) return contactDetailsCopy;
  return text;
}

export function knownCopy(
  value: string | undefined,
  retired: string[],
  next: string,
) {
  const text = trimmed(value);
  if (!text || retired.includes(text)) return next;
  return value ?? next;
}

export function metaDescription(value: string | undefined) {
  const text = trimmed(value);
  if (!text || retiredDescriptions.includes(text)) return artistTagline;
  return value ?? artistTagline;
}
