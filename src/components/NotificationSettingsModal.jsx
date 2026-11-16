import { useState } from "react";
import { Bell, Check, Copy, X } from "lucide-react";
import { getCalendarFeedUrl } from "../api/alertApi";

const isE164 = (value) => /^\+[1-9]\d{1,14}$/.test(value);

export default function NotificationSettingsModal({
  isOpen,
  user,
  settings,
  onSave,
  onClose,
}) {
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || "");
  const [preferences, setPreferences] = useState(
    settings.notificationPreferences,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const togglePreference = (key) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };
  const feedUrl = getCalendarFeedUrl(user.id);
  const normalizedPhone = phoneNumber.replace(/[\s()-]/g, "");

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    if (normalizedPhone && !isE164(normalizedPhone)) {
      setError("Enter a valid phone number in E.164 format, e.g. +919876543210.");
      return;
    }
    if (preferences.whatsapp && !isE164(normalizedPhone)) {
      setError("A valid E.164 phone number is required to enable WhatsApp.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        phoneNumber: normalizedPhone,
        notificationPreferences: preferences,
      });
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save alert settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the calendar URL. Please copy it manually.");
    }
  };

  const toggles = [
    { key: "email", label: "Email Alerts", description: "Receive reminders by email." },
    { key: "whatsapp", label: "WhatsApp Alerts", description: "Send reminders to your phone number." },
    { key: "mobileAlarm", label: "Mobile Device Alarm", description: "Enable in-app chime and vibration checks." },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-settings-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#3B66F5]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="notification-settings-title"
                className="text-lg font-bold text-slate-900"
              >
                Alert settings
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose how and when reminders reach you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close alert settings"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="notification-phone"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Phone number
            </label>
            <input
              id="notification-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+919876543210"
              aria-invalid={Boolean(error && (preferences.whatsapp || phoneNumber))}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-[#3B66F5] focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Include country code in E.164 format, e.g. +91 followed by your number.
            </p>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 px-3.5">
            {toggles.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(preferences[key])}
                  aria-label={label}
                  onClick={() => togglePreference(key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    preferences[key] ? "bg-[#3B66F5]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      preferences[key] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label
              htmlFor="notification-lead-time"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Reminder lead time
            </label>
            <select
              id="notification-lead-time"
              value={preferences.leadTimeMinutes}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  leadTimeMinutes: Number(event.target.value),
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm"
            >
              <option value={15}>15 mins before deadline</option>
              <option value={30}>30 mins before deadline</option>
              <option value={60}>60 mins before deadline</option>
            </select>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#3B66F5] py-3 text-sm font-semibold text-white hover:bg-[#2F56D9] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save alert settings"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-800">
            Live phone calendar feed
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Add the feed in Google Calendar via <b>Other calendars → From URL</b>,
            or on Apple devices via <b>Settings → Calendar → Accounts → Add
            Account → Other → Add Subscribed Calendar</b>.
          </p>
          <code className="mt-3 block break-all rounded-lg bg-slate-50 p-2.5 text-[10px] text-slate-600">
            {feedUrl}
          </code>
          <button
            type="button"
            onClick={() => void handleCopyUrl()}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Live Phone Calendar Sync URL"}
          </button>
          <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">
            Calendar feed access requires a Bearer access token. Calendar
            providers that fetch URLs themselves cannot send this app’s token,
            so live subscription may require backend support for a dedicated
            calendar token. Use “Set Phone Alarm” on a task to download its
            authenticated calendar event.
          </p>
        </div>
      </section>
    </div>
  );
}
