import { useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
  Volume2,
} from "lucide-react";

const playPreviewChime = async () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("Audio is not supported");

  const context = new AudioContextClass();
  if (context.state === "suspended") await context.resume();
  const start = context.currentTime;
  [587.33, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const onset = start + index * 0.2;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, onset);
    gain.gain.exponentialRampToValueAtTime(0.09, onset + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, onset + 0.38);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(onset);
    oscillator.stop(onset + 0.4);
  });
  window.setTimeout(() => void context.close(), 1000);
};

const features = [
  {
    icon: CalendarDays,
    title: "Your whole week, in view",
    description:
      "Plan Monday through Sunday with clear open and completed counts.",
    className: "bg-blue-50 text-blue-700",
  },
  {
    icon: Search,
    title: "Find it. Swipe it. Done.",
    description:
      "Search tasks instantly and use natural touch gestures on mobile.",
    className: "bg-violet-50 text-violet-700",
  },
  {
    icon: UsersRound,
    title: "One team, the right access",
    description:
      "Create shared workspaces with OWNER, ADMIN, MEMBER, and VIEWER roles.",
    className: "bg-emerald-50 text-emerald-700",
  },
];

export default function LandingPage({ isAuthenticated, onNavigate }) {
  const [chimeState, setChimeState] = useState("idle");
  const [previewCompleted, setPreviewCompleted] = useState(2);
  const [previewOpen, setPreviewOpen] = useState(3);
  const previewTotal = 5;

  const handleTestChime = async () => {
    setChimeState("playing");
    try {
      await playPreviewChime();
      if (typeof navigator.vibrate === "function") {
        navigator.vibrate([120, 80, 120]);
      }
      setChimeState("played");
    } catch {
      setChimeState("unsupported");
    }
    window.setTimeout(() => setChimeState("idle"), 3000);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F9FF] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex items-center gap-2.5 text-left"
          aria-label="Weekly Task Planner home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B66F5] text-white shadow-lg shadow-blue-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold tracking-tight sm:text-base">
            Weekwise
          </span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(isAuthenticated ? "/app" : "/login")}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#3B66F5]/40 hover:text-[#3B66F5] sm:px-5 sm:text-sm"
        >
          {isAuthenticated ? "Open My Workspace" : "Sign In"}
        </button>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-16">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3B66F5] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            A calmer way to get the week done
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.7rem]">
            Make space for your best work,{" "}
            <span className="text-[#3B66F5]">one week at a time.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            See every Monday-to-Sunday task at a glance. Bring your team into
            shared workspaces with thoughtful role controls, then let 15-minute
            email, WhatsApp, and phone-calendar reminders keep the important
            things on track.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate("/demo")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3B66F5] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#2F56D9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5]"
            >
              Try Interactive Demo (No Login)
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onNavigate(isAuthenticated ? "/app" : "/register")
              }
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#3B66F5]/40 hover:text-[#3B66F5]"
            >
              {isAuthenticated ? "Open My Workspace" : "Sign In / Get Started"}
            </button>
          </div>
          <p className="mt-4 text-[11px] text-slate-400">
            Jump into the demo straight away. No account or setup required.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-10 top-4 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="absolute -right-8 bottom-0 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white bg-white/80 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Your week, in focus
                </p>
                <h2 className="mt-1 text-lg font-bold">This week</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700">
                Looking good
              </span>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className={`rounded-xl py-2.5 ${
                    index === 2
                      ? "bg-[#3B66F5] text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  <span className="block text-[9px] font-medium opacity-70">
                    {day}
                  </span>
                  <span className="mt-1 block text-xs font-bold">
                    {12 + index}
                  </span>
                  <span
                    className={`mx-auto mt-1.5 block h-1 w-1 rounded-full ${
                      [0, 2, 4, 6].includes(index)
                        ? index === 2
                          ? "bg-white"
                          : "bg-[#3B66F5]"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#EEF3FF] p-3.5">
                <p className="text-[10px] font-semibold text-slate-500">
                  COMPLETED
                </p>
                <p className="mt-1 text-2xl font-bold">{previewCompleted}</p>
              </div>
              <div className="rounded-2xl bg-[#FFF0F0] p-3.5">
                <p className="text-[10px] font-semibold text-slate-500">OPEN</p>
                <p className="mt-1 text-2xl font-bold">{previewOpen}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                {Math.round((previewCompleted / previewTotal) * 100)}% of the
                week complete
              </span>
              <button
                type="button"
                onClick={() =>
                  {
                    if (previewOpen > 0) {
                      setPreviewCompleted((count) => count + 1);
                      setPreviewOpen((count) => count - 1);
                    } else {
                      setPreviewCompleted(0);
                      setPreviewOpen(previewTotal);
                    }
                  }
                }
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#3B66F5] hover:underline"
              >
                <Check className="h-3 w-3" />
                Try a status toggle
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {[
                ["Share the project update", "9:30 AM", "High"],
                ["Review team feedback", "1:00 PM", "Medium"],
              ].map(([title, time, priority]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-3"
                >
                  <span className="h-4 w-4 rounded border border-slate-300" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">
                    {title}
                  </span>
                  <span className="text-[10px] text-slate-400">{time}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      priority === "High" ? "bg-rose-400" : "bg-amber-400"
                    }`}
                    aria-label={`${priority} priority`}
                  />
                </div>
              ))}
            </div>
            <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <BellRing className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] font-bold text-slate-800">
                  Gentle nudge
                </span>
                <span className="block text-[9px] text-slate-400">
                  15 min before
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3B66F5]">
            A little more headspace
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            The details that make a week work
          </h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, className }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </article>
          ))}
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Smartphone className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-bold">A nudge, your way</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Email, WhatsApp, and calendar alarms help keep a deadline in
              sight.
            </p>
            <button
              type="button"
              onClick={() => void handleTestChime()}
              disabled={chimeState === "playing"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
            >
              <Volume2 className="h-3.5 w-3.5" />
              {chimeState === "playing"
                ? "Playing..."
                : chimeState === "played"
                  ? "Chime played"
                  : chimeState === "unsupported"
                    ? "Audio unavailable"
                    : "Test Phone Alarm Chime"}
            </button>
          </article>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 py-6 text-white sm:flex-row sm:px-8">
          <div>
            <h3 className="text-base font-bold">Plan a week for yourself.</h3>
            <p className="mt-1 text-xs text-slate-300">
              Explore the planner with sample tasks—your changes stay in this
              browser.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("/demo")}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-900 transition hover:bg-blue-50"
          >
            Explore the free demo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Guest demo data stays on this device until you reset or import it.
        </div>
      </section>

      <footer className="border-t border-slate-200/70 bg-white/70 px-5 py-5 text-center text-[10px] text-slate-400">
        Weekwise · Make the week yours
      </footer>
    </main>
  );
}
