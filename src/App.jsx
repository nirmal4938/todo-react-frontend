import { useState } from "react";
import useTasks from "./hooks/useTasks";
import useCalendarNavigation from "./hooks/useCalendarNavigation";
import useTaskBoard from "./hooks/useTaskBoard";
import useTaskDialogs from "./hooks/useTaskDialogs";
import OnboardingScreen from "./components/OnboardingScreen";
import PlannerPage from "./components/PlannerPage";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("todo_onboarded"),
  );
  const tasks = useTasks();
  const calendar = useCalendarNavigation();
  const board = useTaskBoard({
    weeksData: tasks.weeksData,
    currentMonday: calendar.currentMonday,
    selectedDate: calendar.selectedDate,
    today: calendar.today,
    viewAllWeek: calendar.viewAllWeek,
  });
  const dialogs = useTaskDialogs();

  const handleCompleteOnboarding = () => {
    localStorage.setItem("todo_onboarded", "true");
    setShowOnboarding(false);
  };
  const handleSaveTask = async (payload) => {
    const previousView = {
      currentMonday: calendar.currentMonday,
      selectedDate: calendar.selectedDate,
      viewAllWeek: calendar.viewAllWeek,
      selectedStatus: board.selectedStatus,
    };
    const taskDate = new Date(payload.scheduledAt);
    calendar.navigateToTaskDate(taskDate);
    board.clearStatusFilter();
    try {
      await tasks.saveTask(payload, dialogs.editingTask);
      dialogs.closeTaskModal();
    } catch (saveError) {
      calendar.restoreNavigation(previousView);
      board.restoreStatusFilter(previousView.selectedStatus);
      throw saveError;
    }
  };

  if (showOnboarding) {
    return <OnboardingScreen onGetStarted={handleCompleteOnboarding} />;
  }

  return (
    <PlannerPage
      tasks={tasks}
      calendar={calendar}
      board={board}
      dialogs={dialogs}
      onSaveTask={handleSaveTask}
    />
  );
}
