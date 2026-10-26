import Link from "next/link";
import { RecoveryRequestForm } from "@/components/admin/auth-forms";
export default function Page() {
  return (
    <main id="main" className="admin-login">
      <Link href="/admin/login">← Back to sign-in</Link>
      <h1>Reset your password</h1>
      <p>Request a recovery link for your administrator account.</p>
      <RecoveryRequestForm />
    </main>
  );
}
