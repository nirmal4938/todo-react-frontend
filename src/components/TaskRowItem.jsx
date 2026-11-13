import { useId, useRef, useState } from "react";
import { Check, SquarePen, Trash2 } from "lucide-react";
import { formatTimeOnly } from "../utils/dateUtils";

const PRIORITY_DOT = {
  High: "bg-rose-500",
  Medium: "bg-amber-400",
  Low: "bg-emerald-500",
};

export default function TaskRowItem({
  task,
  isPending = false,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const [offsetX, setOffsetX] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const offsetRef = useRef(0);
  const touchStartRef = useRef(null);
  const swipeOccurredRef = useRef(false);
  const touchHintId = useId();
  const isCompleted = task.status === "Completed";
  const hasLongText =
    task.title.length > 28 || (task.description?.length || 0) > 40;

  const handleTouchStart = (event) => {
    if (
      event.target.closest?.("button, input, a") ||
      event.touches.length !== 1
    ) {
      touchStartRef.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      offsetX,
      horizontal: false,
    };
  };

  const handleTouchMove = (event) => {
    const start = touchStartRef.current;
    if (!start || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const differenceX = touch.clientX - start.x;
    const differenceY = touch.clientY - start.y;
    if (
      !start.horizontal &&
      (Math.abs(differenceX) <= Math.abs(differenceY) ||
        Math.abs(differenceX) <= 10)
    ) {
      return;
    }
    start.horizontal = true;
    swipeOccurredRef.current = true;
    const nextOffset = Math.min(0, Math.max(start.offsetX + differenceX, -76));
    offsetRef.current = nextOffset;
    setOffsetX(nextOffset);
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    if (!start) return;
    if (start.horizontal) {
      const nextOffset = offsetRef.current < -38 ? -76 : 0;
      offsetRef.current = nextOffset;
      setOffsetX(nextOffset);
      setTimeout(() => {
        swipeOccurredRef.current = false;
      }, 0);
    }
    touchStartRef.current = null;
  };

  const handleClickCapture = (event) => {
    if (!swipeOccurredRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    swipeOccurredRef.current = false;
  };

  const handleConfirmDelete = async () => {
    const deleted = await onDelete(task._id);
    if (deleted) setConfirmDelete(false);
  };

  return (
    <article
      className="group relative overflow-hidden rounded-xl bg-rose-500"
      aria-label={`Task: ${task.title}`}
      aria-describedby={touchHintId}
    >
      <div
        aria-hidden={offsetX === 0}
        inert={offsetX === 0}
        className="absolute inset-y-0 right-0 flex w-[76px] flex-col items-stretch justify-center text-[11px] font-semibold text-white"
      >
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
              className="flex flex-1 items-center justify-center focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isPending}
              aria-label={`Confirm delete ${task.title}`}
              className="flex flex-1 items-center justify-center border-t border-white/30 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Confirm"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            aria-label={`Delete ${task.title}`}
            tabIndex={offsetX < 0 ? 0 : -1}
            aria-hidden={offsetX === 0}
            className="flex h-full flex-col items-center justify-center gap-0.5 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-white disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClickCapture={handleClickCapture}
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
            disabled={isPending}
            onClick={() => onToggleStatus(task)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B66F5] disabled:cursor-wait disabled:opacity-50 ${
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
                className={`text-[13.5px] font-medium ${
                  textExpanded
                    ? "min-w-0 flex-1 whitespace-normal break-words"
                    : "min-w-0 flex-1 truncate"
                } ${
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
            <p
              className={`text-[11px] text-slate-500 ${
                textExpanded ? "whitespace-normal break-words" : "truncate"
              }`}
            >
              {formatTimeOnly(task.scheduledAt)}
              {task.description ? ` • ${task.description}` : ""}
            </p>
            {hasLongText && (
              <button
                type="button"
                aria-expanded={textExpanded}
                onClick={() => setTextExpanded((expanded) => !expanded)}
                className="mt-1 text-[10px] font-semibold text-[#3B66F5] hover:underline focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
              >
                {textExpanded ? "Show less" : "Show more"}
              </button>
            )}
            <span id={touchHintId} className="sr-only">
              On touch screens, swipe left to reveal the delete action.
            </span>
            <span
              aria-hidden="true"
              className="mt-0.5 block text-[9px] text-slate-400 sm:hidden"
            >
              Swipe left to delete
            </span>
          </div>
        </div>

        {confirmDelete ? (
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <span className="text-slate-600">Delete task?</span>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
              className="rounded-md px-1 py-1 text-slate-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#3B66F5] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="rounded-md px-1 py-1 font-semibold text-rose-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#F45B69] disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Confirm"}
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 text-slate-500 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isPending}
              aria-label={`Delete ${task.title}`}
              className="rounded-md p-1 transition hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-[#F45B69] disabled:cursor-wait disabled:opacity-50"
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
        )}
      </div>
    </article>
  );
}
