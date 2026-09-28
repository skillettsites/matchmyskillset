"use client";

import { useActionState } from "react";
import { adminSignIn, type AdminLoginState } from "@/app/admin/actions";

export function AdminLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(adminSignIn, {});
  return (
    <form action={action} className="mx-auto max-w-[400px] rounded-[28px] bg-white p-8">
      <h1 className="title">Admin</h1>
      {!configured && <p className="mt-2 text-[14px] text-[#8a5300]">ADMIN_SECRET is not set (it needs at least 16 characters).</p>}
      <label htmlFor="pw" className="field-label mt-6">
        Password
      </label>
      <input id="pw" name="password" type="password" className="field" autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className="mt-2 text-[14px] text-[#b3261e]">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-primary mt-6 w-full" disabled={pending}>
        {pending ? "Checking..." : "Sign in"}
      </button>
    </form>
  );
}
