"use client";
import { useActionState } from "react";
import {
  login,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from "@/app/admin/auth-actions";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="admin-form">
      <label>
        Email address
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </label>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button className="admin-button" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {
    error: "",
  });
  return (
    <form action={action} className="admin-form">
      <label>
        Current password
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          required
        />
      </label>
      <label>
        Repeat new password
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          required
        />
      </label>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      {state.success && <p role="status">Password updated.</p>}
      <button className="admin-button" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
export function RecoveryRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, {
    error: "",
  });
  return (
    <form action={action} className="admin-form">
      <label>
        Administrator email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      {state.error && (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status">
          If an account exists, a recovery email will be sent. Open the link in
          this browser. Delivery is subject to the project’s email settings and
          rate limits.
        </p>
      )}
      <button className="admin-button" disabled={pending}>
        Request recovery email
      </button>
    </form>
  );
}
export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, { error: "" });
  return (
    <form action={action} className="admin-form">
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          required
        />
      </label>
      <label>
        Repeat password
        <input
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={128}
          required
        />
      </label>
      {state.error && (
        <p role="alert" className="admin-error">
          {state.error}
        </p>
      )}
      <button className="admin-button" disabled={pending}>
        Set password and return to sign-in
      </button>
    </form>
  );
}
