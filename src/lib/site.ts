import type { Metadata } from "next";
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
const deploymentHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
export const siteUrl = new URL(
  configuredUrl && !(process.env.VERCEL && configuredUrl.includes("localhost"))
    ? configuredUrl
    : deploymentHost
      ? `https://${deploymentHost}`
      : "http://localhost:3000",
);
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: { url: string; alt: string; width?: number; height?: number },
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Jessica Mary Monk`,
      description,
      url: path,
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Jessica Mary Monk`,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
  };
}
export const questions = [
  {
    title: "Have you seen The Hands of Worcester in person?",
    options: ["Yes", "No"],
  },
  {
    title: "Are you a Worcester resident or visiting the area?",
    options: [
      "Worcester resident",
      "Visiting the area",
      "Other",
      "Prefer not to say",
    ],
  },
  { title: "What was your first impression of the artwork?" },
  { title: "What emotions did the artwork evoke?" },
  { title: "What do you think the installation represents?" },
  {
    title:
      "Did the artwork encourage you to think differently about public art?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    title: "How important do you think public art is to local communities?",
    options: ["1 — Not important", "2", "3", "4", "5 — Very important"],
  },
  {
    title: "Would you like to see more public art installations in Worcester?",
    options: ["Yes", "No", "Not sure"],
  },
  { title: "Is there anything else you would like to share?" },
] satisfies { title: string; options?: string[] }[];
