import { siteUrl } from "./site";
// Canonical SEO URLs stay on production; authentication must return to its own deployment.
export function authOrigin() {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL)
    return new URL(`https://${process.env.VERCEL_URL}`);
  return siteUrl;
}
