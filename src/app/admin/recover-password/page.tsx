import { requireAdmin } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/admin/auth-forms";
export default async function Page() {
  await requireAdmin();
  return (
    <main id="main" className="admin-login">
      <h1>Choose a new password</h1>
      <p>Use a unique password of at least 10 characters.</p>
      <ResetPasswordForm />
    </main>
  );
}
