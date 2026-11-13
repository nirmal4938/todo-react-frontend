export default function TaskToast({ toast }) {
  if (!toast) return null;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
      }`}
    >
      {toast.message}
    </div>
  );
}
