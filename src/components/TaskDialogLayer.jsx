import TaskFormModal from "./TaskFormModal";
import SearchOverlay from "./SearchOverlay";

export default function TaskDialogLayer({
  dialogs,
  selectedDate,
  onSaveTask,
  onToggleStatus,
  onDeleteTask,
  pendingTaskIds,
  refreshTrigger,
  actionError,
  isViewer = false,
  workspaceId,
  notificationPreferences,
  notificationPhoneNumber,
  reminderLeadTimeMinutes = 15,
  guestMode = false,
  searchTasks,
}) {
  return (
    <>
      <TaskFormModal
        key={`${dialogs.isModalOpen ? "open" : "closed"}-${dialogs.editingTask?._id || "new"}`}
        isOpen={dialogs.isModalOpen && !isViewer}
        initialTask={dialogs.editingTask}
        defaultDate={selectedDate}
        openerElement={dialogs.taskModalOpenerElement}
        onClose={dialogs.closeTaskModal}
        onSave={onSaveTask}
        notificationPreferences={notificationPreferences}
        notificationPhoneNumber={notificationPhoneNumber}
        guestMode={guestMode}
      />

      <SearchOverlay
        key={workspaceId}
        isOpen={dialogs.isSearchOpen}
        onClose={dialogs.closeSearch}
        openerElement={dialogs.searchOpenerElement}
        onToggleStatus={onToggleStatus}
        pendingTaskIds={pendingTaskIds}
        onEdit={(task) => {
          dialogs.openEditTask(task, true);
          dialogs.closeSearch();
        }}
        onDelete={onDeleteTask}
        refreshTrigger={refreshTrigger}
        actionError={actionError}
        isViewer={isViewer}
        workspaceId={workspaceId}
        reminderLeadTimeMinutes={reminderLeadTimeMinutes}
        guestMode={guestMode}
        searchTasks={searchTasks}
      />
    </>
  );
}
