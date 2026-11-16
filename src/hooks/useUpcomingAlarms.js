import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUpcomingAlarmsApi } from "../api/alertApi";

const DISMISSED_KEY = "todo_alarm_dismissed:";
const SNOOZED_KEY = "todo_alarm_snoozed:";
const POLL_INTERVAL = 60_000;

const playChime = async () => {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("Web Audio is unavailable");

  const audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") await audioContext.resume();
  const start = audioContext.currentTime;
  [523.25, 659.25].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const onset = start + index * 0.24;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, onset);
    gain.gain.exponentialRampToValueAtTime(0.12, onset + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, onset + 0.42);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(onset);
    oscillator.stop(onset + 0.45);
  });
  window.setTimeout(() => void audioContext.close(), 1200);
};

const hasSessionFlag = (key, taskId) =>
  sessionStorage.getItem(`${key}${taskId}`) === "true";

export default function useUpcomingAlarms({
  enabled,
  leadTimeMinutes,
  workspaceId,
  onMarkCompleted,
}) {
  const [alarmState, setAlarmState] = useState(null);
  const [soundState, setSoundState] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const alarmRef = useRef(null);
  const alarm =
    enabled && alarmState?.workspaceId === workspaceId ? alarmState.task : null;
  const soundNeedsGesture =
    enabled &&
    soundState?.workspaceId === workspaceId &&
    soundState.needsGesture;
  const error =
    enabled && errorState?.workspaceId === workspaceId
      ? errorState.message
      : "";

  const notifyAlarm = useCallback(
    async (task) => {
      alarmRef.current = { workspaceId, task };
      setAlarmState({ workspaceId, task });
      try {
        await playChime();
        setSoundState({ workspaceId, needsGesture: false });
      } catch {
        setSoundState({ workspaceId, needsGesture: true });
      }
      if (typeof navigator.vibrate === "function") {
        navigator.vibrate([300, 150, 300, 150, 500]);
      }
    },
    [workspaceId],
  );

  useEffect(() => {
    if (!enabled || !workspaceId) return undefined;

    let active = true;
    let timer;
    const poll = async () => {
      try {
        const tasks = await fetchUpcomingAlarmsApi();
        if (!active) return;
        alarmRef.current =
          alarmRef.current?.workspaceId === workspaceId
            ? alarmRef.current
            : null;
        setErrorState({ workspaceId, message: "" });

        const now = Date.now();
        const leadTime = Number(leadTimeMinutes || 15) * 60_000;
        const candidate = tasks.find((task) => {
          const taskId = String(task.id || task._id);
          const channels = task.channels || task.reminderConfig?.channels || [];
          const dueIn = new Date(task.dateTime || task.scheduledAt).getTime() - now;
          const snoozedUntil = Number(
            sessionStorage.getItem(`${SNOOZED_KEY}${taskId}`) || 0,
          );
          return (
            channels.includes("MOBILE_ALARM") &&
            dueIn >= 0 &&
            dueIn <= leadTime &&
            !hasSessionFlag(DISMISSED_KEY, taskId) &&
            snoozedUntil <= now
          );
        });

        if (
          candidate &&
          String(candidate.id || candidate._id) !==
            String(
              alarmRef.current?.task?.id || alarmRef.current?.task?._id,
            )
        ) {
          await notifyAlarm(candidate);
        } else if (!candidate && alarmRef.current) {
          const currentTask = alarmRef.current.task;
          const currentId = String(currentTask.id || currentTask._id);
          const remainsUpcoming = tasks.some(
            (task) =>
              String(task.id || task._id) === currentId &&
              !hasSessionFlag(DISMISSED_KEY, currentId),
          );
          if (!remainsUpcoming) {
            alarmRef.current = null;
            setAlarmState(null);
          }
        }
      } catch (requestError) {
        if (active && requestError?.code !== "ERR_CANCELED") {
          setErrorState({
            workspaceId,
            message:
              requestError.response?.data?.message ||
              "Mobile alarms are temporarily unavailable.",
          });
        }
      } finally {
        if (active) timer = window.setTimeout(poll, POLL_INTERVAL);
      }
    };

    void poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [enabled, leadTimeMinutes, notifyAlarm, workspaceId]);

  const snooze = useCallback(() => {
    if (!alarm) return;
    const taskId = String(alarm.id || alarm._id);
    sessionStorage.setItem(
      `${SNOOZED_KEY}${taskId}`,
      String(Date.now() + 5 * 60_000),
    );
    alarmRef.current = null;
    setAlarmState(null);
  }, [alarm]);

  const dismiss = useCallback(() => {
    if (!alarm) return;
    const taskId = String(alarm.id || alarm._id);
    sessionStorage.setItem(`${DISMISSED_KEY}${taskId}`, "true");
    alarmRef.current = null;
    setAlarmState(null);
    setSoundState({ workspaceId, needsGesture: false });
  }, [alarm, workspaceId]);

  const markCompleted = useCallback(async () => {
    if (!alarm) return;
    const task = { ...alarm, _id: alarm.id || alarm._id, status: "In Progress" };
    const completed = await onMarkCompleted(task);
    if (completed !== false) dismiss();
  }, [alarm, dismiss, onMarkCompleted]);

  const enableSound = useCallback(async () => {
    try {
      await playChime();
      setSoundState({ workspaceId, needsGesture: false });
    } catch {
      setErrorState({
        workspaceId,
        message: "This browser does not support audio playback.",
      });
    }
  }, [workspaceId]);

  return {
    alarm,
    error,
    soundNeedsGesture,
    snooze,
    dismiss,
    markCompleted,
    enableSound,
  };
}
