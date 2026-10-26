import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSession } from "@/lib/auth";
import { LoginForm } from "@/components/admin/auth-forms";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>;
}) {
  if (await adminSession()) redirect("/admin");
  const { recovery } = await searchParams;
  return (
    <main id="main" className="admin-login">
      <Link href="/">← Jessica Mary Monk website</Link>
      <p className="admin-kicker">Private administration</p>
      <h1>Welcome back.</h1>
      <p>Sign in to manage your website and artwork.</p>
      {recovery && (
        <p role="alert" className="admin-error">
          {recovery === "access-denied"
            ? "This account does not have administrator access."
            : "This password setup or recovery link is invalid or expired. Request a new link and open it in the same browser."}
        </p>
      )}
      <LoginForm />
      <p>
        <Link href="/admin/forgot-password">Forgot your password?</Link>
      </p>
      <p className="admin-help">
        Accounts are created privately by the project owner. Public registration
        is disabled.
      </p>
    </main>
  );
}
