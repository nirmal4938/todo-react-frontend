import { useEffect, useState } from "react";

export default function TaskToast({ toast }) {
  const [permissionToast, setPermissionToast] = useState(null);
  const visibleToast = permissionToast || toast;

  useEffect(() => {
    const handleForbidden = (event) => {
      setPermissionToast({
        message:
          event.detail?.message ||
          "Your workspace role does not allow this action.",
        type: "error",
      });
    };
    const handleAlarmDownloadError = (event) => {
      setPermissionToast({
        message:
          event.detail?.message ||
          "Could not download the phone alarm calendar event.",
        type: "error",
      });
    };
    window.addEventListener("api:forbidden", handleForbidden);
    window.addEventListener(
      "api:alarm-download-error",
      handleAlarmDownloadError,
    );
    return () => {
      window.removeEventListener("api:forbidden", handleForbidden);
      window.removeEventListener(
        "api:alarm-download-error",
        handleAlarmDownloadError,
      );
    };
  }, []);

  useEffect(() => {
    if (!permissionToast) return undefined;
    const timer = setTimeout(() => setPermissionToast(null), 3500);
    return () => clearTimeout(timer);
  }, [permissionToast]);

  if (!visibleToast) return null;

  return (
    <div
      role={visibleToast.type === "error" ? "alert" : "status"}
      className={`fixed left-1/2 top-4 z-[80] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        visibleToast.type === "error" ? "bg-rose-600" : "bg-slate-900"
      }`}
    >
      {visibleToast.message}
    </div>
  );
}
