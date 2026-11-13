import { useCallback, useState } from "react";

export default function useTaskDialogs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchOpenerElement, setSearchOpenerElement] = useState(null);
  const [taskModalOpenerElement, setTaskModalOpenerElement] = useState(null);

  const openSearch = useCallback((openerElement = document.activeElement) => {
    setSearchOpenerElement(openerElement);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  const openNewTask = useCallback(
    (openerElement = document.activeElement) => {
      setTaskModalOpenerElement(openerElement);
      setEditingTask(null);
      setIsModalOpen(true);
    },
    [],
  );

  const openEditTask = useCallback(
    (
      task,
      fromSearch = false,
      openerElement = document.activeElement,
    ) => {
      setTaskModalOpenerElement(
        fromSearch && searchOpenerElement?.isConnected
          ? searchOpenerElement
          : openerElement,
      );
      setEditingTask(task);
      setIsModalOpen(true);
    },
    [searchOpenerElement],
  );

  const closeTaskModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  return {
    isModalOpen,
    editingTask,
    isSearchOpen,
    searchOpenerElement,
    taskModalOpenerElement,
    openSearch,
    closeSearch,
    openNewTask,
    openEditTask,
    closeTaskModal,
  };
}
