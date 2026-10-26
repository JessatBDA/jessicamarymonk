import Link from "next/link";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Privacy information",
  "How the Jessica Mary Monk website handles Share your hands, names, and other visitor information.",
  "/privacy",
);

export default function Page() {
  return (
    <article className="wrap prose">
      <p className="eyebrow">Privacy</p>
      <h1>Privacy information.</h1>
      <p>
        This notice covers the public pages of this website, including Share
        your hands and Add your name for The Hands of Worcester. The contact
        form is not open, and the site does not take orders or payments.
      </p>
      <h2>Who is responsible</h2>
      <p>
        Jessica Mary Monk is the person responsible for the information
        collected for The Hands of Worcester. Use the contact details published
        on the <Link href="/contact">contact page</Link>. A postal address and
        a dedicated privacy email have not been added to this page yet.
      </p>
      <h2>Share your hands</h2>
      <p>
        If you answer the questions, or send a picture, a poem or other
        writing, the site stores what you typed, and the picture if you added
        one. You can also give an optional name or first name, an age range,
        and whether the response is from a school or group, with that group’s
        name. You are asked not to include phone numbers, email addresses or
        home addresses in the words or the picture.
      </p>
      <p>
        A required box asks you to confirm that the response may be shared on
        this website or in project reporting, that it is your own work, and,
        if you are under 16, that a parent or teacher has agreed. A separate
        box, which is not ticked for you, asks for permission to show your
        name. If you are under 16, a parent or teacher gives that permission
        for you. The time you gave permission is stored with the response.
      </p>
      <p>
        Answers, pictures and writing are not shown on the website until
        Jessica approves them. Your name is never shown unless you gave
        permission and she approves the name as well. Age ranges are not
        published. You can ask for a response to be removed.
      </p>
      <h2>Add your name</h2>
      <p>
        The name form stores the name you enter, an optional town, school or
        group, and whether you took part in a workshop. The same unticked
        permission box applies. Sending the form means it may be stored so it
        can be reviewed. The name is shown on the participant list only when
        permission was given and Jessica approves it.
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
        can then be viewed on the Share your hands page.
      </p>
      <h2>The older questionnaire preview</h2>
      <p>
        The page at{" "}
        <Link href="/engagement/the-hands-of-worcester">
          the visitor questionnaire preview
        </Link>{" "}
        does not save anything. The contact form does not save messages.
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
