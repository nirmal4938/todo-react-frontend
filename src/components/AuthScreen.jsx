import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function AuthScreen({ mode, onNavigate }) {
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const credentials = {
        ...(isRegistering ? { name: name.trim() } : {}),
        email: email.trim(),
        password,
      };
      if (isRegistering) await signUp(credentials);
      else await signIn(credentials);
      onNavigate("/app", true);
    } catch (requestError) {
      const status = requestError.response?.status;
      const message = requestError.response?.data?.message;
      if (status === 429) {
        setError(message || "Too many login attempts. Please try again later.");
      } else if (status === 401) {
        setError("Email or password is incorrect. Please try again.");
      } else {
        setError(message || "Unable to authenticate. Please try again.");
      }
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
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {isRegistering
            ? "Create an account and your personal workspace."
            : "Sign in to open your workspace and manage your tasks."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                autoComplete="name"
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#3B66F5] focus:ring-2 focus:ring-blue-100"
              />
            </label>
          )}
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
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
              minLength={isRegistering ? 12 : 1}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#3B66F5] focus:ring-2 focus:ring-blue-100"
            />
            {isRegistering && (
              <span className="mt-1 block text-xs text-slate-400">
                Use at least 12 characters.
              </span>
            )}
          </label>
          {error && (
            <p
              role="alert"
              className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-rose-600 px-4 py-3 text-sm text-white shadow-xl"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white transition hover:bg-[#2F56D9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {submitting
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegistering ? "Already have an account?" : "New to Task Planner?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              onNavigate(isRegistering ? "/login" : "/register");
            }}
            className="font-semibold text-[#3B66F5] hover:underline"
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}
