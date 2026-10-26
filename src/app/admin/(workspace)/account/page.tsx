import { requireAdmin } from "@/lib/auth";
import { PasswordForm } from "@/components/admin/auth-forms";
export default async function Page() {
  const { user } = await requireAdmin();
  return (
    <>
      <h1>Your account</h1>
      <p>
        Signed in as {user.email}. Administrator permissions are managed by the
        project owner in the database.
      </p>
      <section className="admin-panel">
        <h2>Change password</h2>
        <PasswordForm />
      </section>
    </>
  );
}
