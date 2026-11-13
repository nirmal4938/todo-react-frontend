import { useCallback, useMemo, useState } from "react";
import { getMondayOfWeek, isSameDay, parseLocalWeekStart } from "../utils/dateUtils";

const PRIORITIES = ["All", "High", "Medium", "Low"];

const EMPTY_WEEK_SUMMARY = {
  openTasksCount: 0,
  completedTasksCount: 0,
  totalTasksCount: 0,
  tasks: [],
};

export default function useTaskBoard({
  weeksData,
  currentMonday,
  selectedDate,
  today,
  viewAllWeek,
}) {
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const activeWeekSummary = useMemo(
    () =>
      weeksData.find((week) =>
        isSameDay(
          getMondayOfWeek(parseLocalWeekStart(week.weekStart)),
          currentMonday,
        ),
      ) || EMPTY_WEEK_SUMMARY,
    [weeksData, currentMonday],
  );

  const displayedTasks = useMemo(() => {
    const tasks = viewAllWeek
      ? activeWeekSummary.tasks
      : activeWeekSummary.tasks.filter((task) =>
          isSameDay(task.scheduledAt, selectedDate),
        );
    const statusFilteredTasks =
      selectedStatus === "All"
        ? tasks
        : tasks.filter((task) => task.status === selectedStatus);
    return selectedPriority === "All"
      ? statusFilteredTasks
      : statusFilteredTasks.filter(
          (task) => task.priority === selectedPriority,
        );
  }, [
    activeWeekSummary,
    selectedDate,
    selectedPriority,
    selectedStatus,
    viewAllWeek,
  ]);

  const progressPercent =
    activeWeekSummary.totalTasksCount > 0
      ? Math.round(
          (activeWeekSummary.completedTasksCount /
            activeWeekSummary.totalTasksCount) *
            100,
        )
      : 0;

  const taskHeading = viewAllWeek
    ? "All Tasks This Week"
    : isSameDay(selectedDate, today)
      ? "Tasks Today"
      : `Tasks (${selectedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })})`;

  const toggleStatusFilter = useCallback((status) => {
    setSelectedStatus((current) => (current === status ? "All" : status));
  }, []);

  const clearStatusFilter = useCallback(() => {
    setSelectedStatus("All");
  }, []);

  const restoreStatusFilter = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  return {
    priorities: PRIORITIES,
    activeWeekSummary,
    displayedTasks,
    progressPercent,
    taskHeading,
    selectedPriority,
    selectedStatus,
    setSelectedPriority,
    toggleStatusFilter,
    clearStatusFilter,
    restoreStatusFilter,
  };
}
