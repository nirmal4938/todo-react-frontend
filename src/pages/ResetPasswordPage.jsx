import { useEffect, useState } from "react";
import { Check, Circle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { resetPasswordApi, verifyResetTokenApi } from "../api/authApi";

const getResetToken = () =>
  new URLSearchParams(window.location.search).get("token") || "";

export default function ResetPasswordPage({ onNavigate }) {
  const token = getResetToken();
  const [verifying, setVerifying] = useState(Boolean(token));
  const [tokenValid, setTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyResetTokenApi(token)
      .then((response) => {
        if (active) setTokenValid(response.valid === true);
      })
      .catch(() => {
        if (active) setTokenValid(false);
      })
      .finally(() => {
        if (active) setVerifying(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!success) return undefined;
    const timeout = window.setTimeout(
      () => onNavigate("/login", true),
      2000,
    );
    return () => window.clearTimeout(timeout);
  }, [onNavigate, success]);

  const passwordChecks = [
    { label: "At least 8 characters", valid: newPassword.length >= 8 },
    {
      label: "At least 1 uppercase and 1 lowercase letter",
      valid: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    },
    { label: "At least 1 number", valid: /\d/.test(newPassword) },
    {
      label: "Passwords match",
      valid: Boolean(confirmPassword) && newPassword === confirmPassword,
    },
  ];
  const passwordIsValid = passwordChecks.every((check) => check.valid);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await resetPasswordApi({ token, password: newPassword });
      setSuccess(true);
    } catch (requestError) {
      const status = requestError.response?.status;
      const message = requestError.response?.data?.message;
      if (status === 400) {
        setTokenValid(false);
      } else {
        setError(
          status === 429
            ? message || "Too many reset attempts. Please try again later."
            : message || "Unable to reset your password. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderPasswordInput = ({
    label,
    value,
    onChange,
    visible,
    onToggleVisibility,
    autoComplete,
  }) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="relative mt-2 block">
        <input
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-[#3B66F5] focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          onClick={onToggleVisibility}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-800"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Eye aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </span>
    </label>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#3B66F5]">
          Task Planner
        </p>
        {verifying ? (
          <div
            role="status"
            className="flex items-center gap-3 py-12 text-sm text-slate-500"
          >
            <LoaderCircle
              aria-hidden="true"
              className="h-5 w-5 animate-spin text-[#3B66F5]"
            />
            Verifying your reset link...
          </div>
        ) : success ? (
          <div role="status" className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Password updated
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your password has been reset successfully. Redirecting you to
              login...
            </p>
          </div>
        ) : !tokenValid ? (
          <div className="mt-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Invalid or Expired Reset Link
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This password reset link is missing, invalid, or has expired.
              Request a new link to continue.
            </p>
            <button
              type="button"
              onClick={() => onNavigate("/forgot-password")}
              className="mt-6 w-full rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F56D9]"
            >
              Request a new reset link
            </button>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Create a new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose a strong password you haven’t used before.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {renderPasswordInput({
                label: "New Password",
                value: newPassword,
                onChange: setNewPassword,
                visible: showNewPassword,
                onToggleVisibility: () =>
                  setShowNewPassword((current) => !current),
                autoComplete: "new-password",
              })}
              {renderPasswordInput({
                label: "Confirm Password",
                value: confirmPassword,
                onChange: setConfirmPassword,
                visible: showConfirmPassword,
                onToggleVisibility: () =>
                  setShowConfirmPassword((current) => !current),
                autoComplete: "new-password",
              })}

              <ul
                aria-label="Password requirements"
                className="space-y-2 rounded-xl bg-slate-50 p-4"
              >
                {passwordChecks.map(({ label, valid }) => {
                  const Icon = valid ? Check : Circle;
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-2 text-xs ${
                        valid ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {label}
                    </li>
                  );
                })}
              </ul>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !passwordIsValid}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F56D9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                )}
                {submitting ? "Updating password..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
