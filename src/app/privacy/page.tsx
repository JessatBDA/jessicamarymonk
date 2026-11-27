import Link from "next/link";
import portrait from "../../../images/jess-portrait.jpg";
import { pageMetadata } from "@/lib/site";

/** Leave blank while there is no postal address. Rendered only when set. */
const postalAddress = "";

export const metadata = pageMetadata(
  "Privacy information",
  "How the Jessica Mary Monk website handles Feedback, names, and other visitor information.",
  "/privacy",
  {
    url: portrait.src,
    alt: "Jessica Mary Monk smiling, holding her dog on a beach at sunset",
    width: portrait.width,
    height: portrait.height,
  },
);

export default function Page() {
  return (
    <article className="wrap prose">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy information.</h1>
      <p>
        This notice covers the public pages of this website, including Feedback
        and Add your name for The Hands of Worcester. Enquiries can
        be sent through the contact form or to info@jessicamarymonk.com. The
        site does not take orders or payments.
      </p>
      <h2>Who is responsible</h2>
      <p>
        Jessica Mary Monk is the person responsible for the information
        collected for The Hands of Worcester.
        {postalAddress
          ? ` Postal address: ${postalAddress}.`
          : " A postal address has not been added yet."}{" "}
        To get in touch, use the <Link href="/contact">contact page</Link> or
        email info@jessicamarymonk.com.
      </p>
      <h2>Feedback</h2>
      <p>
        If you send feedback, or attach a picture, the site stores what you
        typed, and the picture if you added one. You can also give an optional
        name if you want to be credited. You are asked not to include phone
        numbers, email addresses or home addresses in the words or the picture.
      </p>
      <p>
        A required box asks you to agree that the feedback or artwork may be
        shared on this website, and that any artwork is your own. The time you
        gave that agreement is stored with the response.
      </p>
      <p>
        Feedback and pictures are not shown on the website until Jessica
        approves them. Your name is shown with an approved piece only if you
        gave a name and she approves the name as well. You can ask for a
        response to be removed. Answers sent through the earlier questions are
        still kept until you ask for them to be removed.
      </p>
      <h2>Add your name</h2>
      <p>
        The thank-you list shows the names of people who agreed to be shown. The
        name form stores the name you enter, an optional town, school or group, and
        whether you took part in a workshop. An unticked permission box asks
        whether the name may be shown. Sending the form means it may be stored so it can be reviewed.
        A name is shown only when permission was given and Jessica approves it.
      </p>
      <h2>Why this information is kept</h2>
      <p>
        The information is used to run The Hands of Worcester, to thank
        participants, to share approved responses, and for project reporting,
        including reports Jessica may send to local schools. The lawful basis
        is your consent. You can withdraw permission for your name, or ask for
        your response to be deleted, by using the contact details on the
        contact page.
      </p>
      <h2>Where it is stored, and for how long</h2>
      <p>
        Responses are stored in a private Supabase database used only for this
        website. Pictures are checked, reduced in size, saved as WebP, and
        kept in private storage. The website is hosted on Vercel. Information
        is kept for the life of the project and its reporting, and is deleted
        when you ask or when it is no longer needed for that purpose.
      </p>
      <p>
        The public cannot read the stored responses. A narrow public query
        returns only names that have permission and have been approved, and
        only pictures and writing that Jessica has approved. Approved pictures
        can then be viewed on the Feedback page.
      </p>
      <h2>The older questionnaire preview</h2>
      <p>
        The page at{" "}
        <Link href="/engagement/the-hands-of-worcester">
          the visitor questionnaire preview
        </Link>{" "}
        does not save anything. Messages sent through the contact form are
        saved privately so Jessica can reply. They are not shown on the
        website.
      </p>
      <h2>Cookies</h2>
      <p>
        No analytics or marketing scripts are used on the public pages.
        Signing in to the private administration area uses a necessary cookie
        so the session can stay signed in. That cookie is not used to track
        visitors.
      </p>
      <h2>Your choices</h2>
      <p>
        You can ask to see the information held about a response you sent, ask
        for it to be corrected, or ask for it to be deleted. Because responses
        are not tied to an account, include enough detail for Jessica to find
        the right one, without adding extra contact details into the artwork
        itself. You can also complain to the Information Commissioner’s Office
        if you are unhappy with how your information is used.
      </p>
    </article>
  );
}
