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
}) {
  return (
    <>
      <TaskFormModal
        key={`${dialogs.isModalOpen ? "open" : "closed"}-${dialogs.editingTask?._id || "new"}`}
        isOpen={dialogs.isModalOpen}
        initialTask={dialogs.editingTask}
        defaultDate={selectedDate}
        openerElement={dialogs.taskModalOpenerElement}
        onClose={dialogs.closeTaskModal}
        onSave={onSaveTask}
      />

      <SearchOverlay
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
      />
    </>
  );
}
