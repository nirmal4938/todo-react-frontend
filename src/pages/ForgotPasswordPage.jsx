import { useState } from "react";
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { forgotPasswordApi } from "../api/authApi";

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await forgotPasswordApi(email.trim());
      setDevResetUrl(response.devResetUrl || "");
      setSubmitted(true);
    } catch (requestError) {
      const status = requestError.response?.status;
      const message = requestError.response?.data?.message;
      setError(
        status === 429
          ? message || "Too many reset requests. Please try again later."
          : message || "Unable to send a reset link. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#3B66F5]">
          Task Planner
        </p>
        {submitted ? (
          <div className="mt-6">
            <CheckCircle2
              aria-hidden="true"
              className="h-11 w-11 text-emerald-500"
            />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Check Your Inbox
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              If an account exists for <strong>{email.trim()}</strong>, a
              password reset link has been sent. The link expires in 15
              minutes.
            </p>
            {devResetUrl && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-5 text-amber-900">
                  Local development reset link is ready.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.assign(devResetUrl)}
                  className="mt-3 text-sm font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-950"
                >
                  Open Dev Reset Link
                </button>
              </div>
            )}
            <a
              href="/login"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("/login");
              }}
              className="mt-6 text-sm font-semibold text-[#3B66F5] hover:underline"
            >
              Back to Login
            </a>
          </div>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the email address linked to your account and we’ll send you
              a reset link.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#3B66F5] focus:ring-2 focus:ring-blue-100"
                />
              </label>
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
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F56D9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Mail aria-hidden="true" className="h-4 w-4" />
                )}
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{" "}
              <a
                href="/login"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("/login");
                }}
                className="font-semibold text-[#3B66F5] hover:underline"
              >
                Back to Login
              </a>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
