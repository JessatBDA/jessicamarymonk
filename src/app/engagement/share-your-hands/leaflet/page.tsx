import Link from "next/link";
import QRCode from "qrcode";
import { pageMetadata, siteUrl } from "@/lib/site";

const path = "/engagement/share-your-hands";

export const metadata = {
  ...pageMetadata(
    "Share your hands — printable sheet",
    "A short printable sheet with a QR code for The Hands of Worcester.",
    "/engagement/share-your-hands/leaflet",
  ),
  robots: { index: false, follow: false },
};

export default async function Page() {
  const url = new URL(path, siteUrl).href;
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 440,
    errorCorrectionLevel: "M",
  });
  return (
    <article className="wrap">
      <p className="leaflet-toolbar">
        <Link className="back-link" href={path}>
          ← Share your hands
        </Link>
      </p>
      <div className="leaflet">
        <p className="eyebrow">The Hands of Worcester</p>
        <h1>Share your hands.</h1>
        <p>
          Jessica Mary Monk would like to know what hands mean to you. Answer a
          few questions, or send a drawing, a poem or some writing.
        </p>
        <p>
          Scan the code, or open{" "}
          <strong>jessicamarymonk.com/engagement/share-your-hands</strong>
        </p>
        {/* QR codes are data URLs, which next/image does not accept. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="leaflet-qr"
          src={qr}
          alt="QR code for the Share your hands page"
        />
        <p>Send your feedback, artwork and questions in to the artist.</p>
        <p>The Hands of Worcester · The Worcester Plinth</p>
      </div>
    </article>
  );
}
