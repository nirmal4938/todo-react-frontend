import { useRef, useState } from "react";
import { Check, SquarePen, Trash2 } from "lucide-react";
import { formatTimeOnly } from "../utils/dateUtils";

const PRIORITY_DOT = {
  High: "bg-rose-500",
  Medium: "bg-amber-400",
  Low: "bg-emerald-500",
};

export default function TaskRowItem({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const [offsetX, setOffsetX] = useState(0);
  const offsetRef = useRef(0);
  const startXRef = useRef(null);
  const isCompleted = task.status === "Completed";

  const handleTouchStart = (event) => {
    startXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchMove = (event) => {
    if (startXRef.current === null) return;
    const difference = event.touches[0].clientX - startXRef.current;
    const nextOffset = difference < 0 ? Math.max(difference, -76) : 0;
    offsetRef.current = nextOffset;
    setOffsetX(nextOffset);
  };

  const handleTouchEnd = () => {
    const nextOffset = offsetRef.current < -38 ? -76 : 0;
    offsetRef.current = nextOffset;
    setOffsetX(nextOffset);
    startXRef.current = null;
  };

  return (
    <article
      className="group relative overflow-hidden rounded-xl bg-rose-500"
      aria-label={`Task: ${task.title}`}
    >
      <button
        type="button"
        onClick={() => onDelete(task._id)}
        aria-label={`Delete ${task.title}`}
        className="absolute inset-y-0 right-0 flex w-[76px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ transform: `translateX(${offsetX}px)` }}
        className={`relative flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 transition-transform duration-200 [touch-action:pan-y] ${
          isCompleted ? "bg-[#EEF3FF]" : "bg-[#FFF0F0]"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            aria-label={isCompleted ? "Mark in progress" : "Mark completed"}
            aria-pressed={isCompleted}
            onClick={() => onToggleStatus(task)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] ${
              isCompleted
                ? "border-[#3B66F5] bg-white text-[#3B66F5]"
                : "border-slate-300 bg-white hover:border-[#3B66F5]"
            }`}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`truncate text-[13.5px] font-medium ${
                  isCompleted
                    ? "text-slate-500 line-through"
                    : "text-slate-800"
                }`}
              >
                {task.title}
              </span>
              {task.priority && (
                <span
                  title={`Priority: ${task.priority}`}
                  aria-label={`${task.priority} priority`}
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    PRIORITY_DOT[task.priority] || "bg-amber-400"
                  }`}
                />
              )}
            </div>
            <p className="truncate text-[11px] text-slate-500">
              {formatTimeOnly(task.scheduledAt)}
              {task.description ? ` • ${task.description}` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-slate-500 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            aria-label={`Delete ${task.title}`}
            className="rounded-md p-1 transition hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-[#F45B69]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="rounded-md p-1 transition hover:text-[#3B66F5] focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <SquarePen className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
