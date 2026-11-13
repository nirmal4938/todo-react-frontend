export default function OnboardingScreen({ onGetStarted }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between overflow-hidden bg-white shadow-xl sm:rounded-3xl md:max-w-2xl">
      {/* Top Royal Blue Wave Hero */}
      <div className="relative flex h-[55vh] min-h-[300px] items-center justify-center overflow-hidden bg-[#3B66F5] sm:h-[58vh] md:h-[60vh]">
        {/* Decorative Wavy Pattern Top-Left */}
        <svg
          className="absolute top-12 left-6 w-28 h-24 text-white/15"
          viewBox="0 0 120 80"
          fill="none"
          aria-hidden="true"
        >
          {[0, 16, 32, 48, 64].map((y) => (
            <path
              key={y}
              d={`M0 ${y + 8} Q 15 ${y}, 30 ${y + 8} T 60 ${y + 8} T 90 ${y + 8} T 120 ${y + 8}`}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
          ))}
        </svg>

        {/* Decorative Wavy Pattern Bottom-Right */}
        <svg
          className="absolute bottom-10 right-6 w-28 h-24 text-white/15"
          viewBox="0 0 120 80"
          fill="none"
          aria-hidden="true"
        >
          {[0, 16, 32, 48, 64].map((y) => (
            <path
              key={y}
              d={`M0 ${y + 8} Q 15 ${y}, 30 ${y + 8} T 60 ${y + 8} T 90 ${y + 8} T 120 ${y + 8}`}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
            />
          ))}
        </svg>
      </div>

      {/* Bottom White Content Section */}
      <div className="flex flex-1 flex-col justify-between bg-white px-7 pb-10 pt-8 sm:px-10 md:px-14">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage What To Do
          </h1>
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
            The best way to manage what you have to do, don&apos;t forget your
            plans
          </p>
        </div>

        <button
          onClick={onGetStarted}
          type="button"
          className="w-full rounded-xl bg-[#3B66F5] py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#2F56D9] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B66F5]"
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
