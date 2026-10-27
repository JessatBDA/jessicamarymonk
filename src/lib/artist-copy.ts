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

export const aboutIntroCopy =
  "Jessica Mary Monk is a project manager and web designer by trade, and an artist at heart. Her love of art began as a child, painting birds with her mum, and she went on to study art at school. In her twenties she returned to it in earnest, exploring realism, portraiture and above all hands, the subject that inspired [The Hands of Worcester](/public-art/the-hands-of-worcester).";

export const aboutBackgroundCopy =
  "Hands and community continue to shape her work. Having recently moved to Wales, Jessica is turning to seascapes, which she has begun exploring in acrylic and oil on canvas, and she is curious to see how her interest in community will find its way into them.";

export const aboutPracticeCopy =
  "Jessica paints in acrylic and oil on canvas, and draws in charcoal, chalk and pastel. Her work explores realism, portraiture and hands, and she has begun painting seascapes.";

export const aboutCommunityCopy =
  "The Hands of Worcester was made with people in Worcester and with The Worcester Plinth. Workshops collected plaster casts of hands. The project was supported using public funding by the National Lottery through Arts Council England. With special thanks to The Elmley Foundation.";

export const aboutCommissionsCopy =
  "Enquiries are welcome for public art, community projects, paintings and illustration.";

const aboutSections = {
  practice: aboutPracticeCopy,
  community: aboutCommunityCopy,
  commissions: aboutCommissionsCopy,
} as const;

export const homePracticeHeadingCopy = "An artist at heart.";

export const homePracticeTextCopy =
  "Jessica Mary Monk is a project manager and web designer by trade. Her love of art began painting birds with her mum, and in her twenties she returned to realism, portraiture and hands. Hands and community still shape the work. A move to Wales has started a new interest in seascapes, in acrylic and oil on canvas.";

const retiredPracticeHeading = "A practice that\nconnects with people.";

const retiredPracticeText =
  "Public art, paintings and illustrations by Jessica Mary Monk. Explore the work, discover each project, or get in touch about a creative collaboration.";

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

export function homePracticeHeading(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredPracticeHeading) return homePracticeHeadingCopy;
  return value ?? homePracticeHeadingCopy;
}

export function homePracticeText(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredPracticeText) return homePracticeTextCopy;
  return value ?? homePracticeTextCopy;
}

export function aboutIntro(value: string | undefined) {
  const text = trimmed(value);
  if (!text || text === retiredAboutIntro || text === artistTagline)
    return aboutIntroCopy;
  return value ?? aboutIntroCopy;
}

export function aboutBackground(value: string | undefined) {
  const text = trimmed(value);
  if (
    !text ||
    text === retiredAboutBackground ||
    text === aboutHandsLink ||
    text === aboutNoticeTodo ||
    text === aboutSectionTodo ||
    text === retiredSupplied
  )
    return aboutBackgroundCopy;
  return text;
}

export function aboutNotice(value: string | undefined) {
  const text = trimmed(value);
  if (
    !text ||
    text === retiredAboutNotice ||
    text === aboutNoticeTodo ||
    text === aboutSectionTodo ||
    text === retiredSupplied
  )
    return "";
  return text;
}

export function aboutSection(
  key: keyof typeof aboutSections,
  value: string | undefined,
) {
  const text = trimmed(value);
  if (
    !text ||
    text === retiredSupplied ||
    text === aboutSectionTodo ||
    text === aboutNoticeTodo
  )
    return aboutSections[key];
  return text;
}

export function metaDescription(value: string | undefined) {
  const text = trimmed(value);
  if (!text || retiredDescriptions.includes(text)) return artistTagline;
  return value ?? artistTagline;
}
