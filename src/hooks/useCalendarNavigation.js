import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMondayOfWeek, getWeekDays, isSameDay } from "../utils/dateUtils";

export default function useCalendarNavigation() {
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMondayOfWeek(new Date()),
  );
  const [today, setToday] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewAllWeek, setViewAllWeek] = useState(false);
  const todayRef = useRef(today);
  const selectedDateRef = useRef(selectedDate);
  const currentMondayRef = useRef(currentMonday);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
    currentMondayRef.current = currentMonday;
  }, [selectedDate, currentMonday]);

  useEffect(() => {
    let midnightTimer;
    const syncToday = () => {
      if (document.visibilityState === "hidden") return;
      const nextToday = new Date();
      const previousToday = todayRef.current;
      if (isSameDay(previousToday, nextToday)) return;

      if (isSameDay(selectedDateRef.current, previousToday)) {
        setSelectedDate(nextToday);
      }
      if (
        isSameDay(
          currentMondayRef.current,
          getMondayOfWeek(previousToday),
        )
      ) {
        setCurrentMonday(getMondayOfWeek(nextToday));
      }
      todayRef.current = nextToday;
      setToday(nextToday);
    };

    const scheduleMidnightRefresh = () => {
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 0, 100);
      midnightTimer = setTimeout(() => {
        syncToday();
        scheduleMidnightRefresh();
      }, nextMidnight.getTime() - Date.now());
    };

    window.addEventListener("focus", syncToday);
    document.addEventListener("visibilitychange", syncToday);
    scheduleMidnightRefresh();
    return () => {
      window.removeEventListener("focus", syncToday);
      document.removeEventListener("visibilitychange", syncToday);
      clearTimeout(midnightTimer);
    };
  }, []);

  const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);
  const showToday =
    viewAllWeek ||
    !isSameDay(currentMonday, getMondayOfWeek(today)) ||
    !isSameDay(selectedDate, today);

  const shiftWeek = useCallback(
    (offsetWeeks) => {
      const nextMonday = new Date(currentMonday);
      nextMonday.setDate(currentMonday.getDate() + offsetWeeks * 7);
      setCurrentMonday(nextMonday);
      setSelectedDate(nextMonday);
      setViewAllWeek(false);
    },
    [currentMonday],
  );

  const selectDate = useCallback((date) => {
    setSelectedDate(date);
    setViewAllWeek(false);
  }, []);

  const jumpToToday = useCallback(() => {
    const currentToday = todayRef.current;
    setCurrentMonday(getMondayOfWeek(currentToday));
    setSelectedDate(currentToday);
    setViewAllWeek(false);
  }, []);

  const navigateToTaskDate = useCallback((date) => {
    setCurrentMonday(getMondayOfWeek(date));
    setSelectedDate(date);
    setViewAllWeek(false);
  }, []);

  const restoreNavigation = useCallback((snapshot) => {
    setCurrentMonday(snapshot.currentMonday);
    setSelectedDate(snapshot.selectedDate);
    setViewAllWeek(snapshot.viewAllWeek);
  }, []);

  return {
    currentMonday,
    selectedDate,
    today,
    viewAllWeek,
    weekDays,
    showToday,
    shiftWeek,
    selectDate,
    jumpToToday,
    setViewAllWeek,
    navigateToTaskDate,
    restoreNavigation,
  };
}
