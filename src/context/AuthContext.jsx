import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./authContextValue";
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  restoreSession,
  setAccessToken,
} from "../api/authApi";
import { saveNotificationSettingsApi } from "../api/alertApi";

const DEFAULT_NOTIFICATION_SETTINGS = {
  phoneNumber: "",
  notificationPreferences: {
    email: true,
    whatsapp: false,
    mobileAlarm: true,
    leadTimeMinutes: 15,
  },
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(
    () => window.location.pathname !== "/demo",
  );
  const [notificationSettings, setNotificationSettings] = useState(
    DEFAULT_NOTIFICATION_SETTINGS,
  );

  useEffect(() => {
    let active = true;
    let skippedDemoHydration = window.location.pathname === "/demo";
    const handleExpired = () => setSession(null);
    const handleNavigation = () => {
      const isDemoRoute = window.location.pathname === "/demo";
      if (isDemoRoute) {
        skippedDemoHydration = true;
        return;
      }
      if (!skippedDemoHydration) return;
      skippedDemoHydration = false;
      restoreSession()
        .then((restoredSession) => {
          if (active) setSession(restoredSession);
        })
        .catch(() => {
          if (active) setSession(null);
        });
    };
    window.addEventListener("auth:expired", handleExpired);
    window.addEventListener("popstate", handleNavigation);
    if (!skippedDemoHydration) {
      restoreSession()
        .then((restoredSession) => {
          if (active) setSession(restoredSession);
        })
        .catch(() => {
          if (active) setSession(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      window.removeEventListener("auth:expired", handleExpired);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const nextSession = await loginApi(credentials);
    setAccessToken(nextSession.accessToken);
    setSession(nextSession);
    return nextSession;
  }, []);

  const signUp = useCallback(async (credentials) => {
    const nextSession = await registerApi(credentials);
    setAccessToken(nextSession.accessToken);
    setSession(nextSession);
    return nextSession;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setAccessToken(null);
      setSession(null);
      setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
    }
  }, []);

  const saveNotificationSettings = useCallback(async (settings) => {
    const savedSettings = await saveNotificationSettingsApi(settings);
    setNotificationSettings(savedSettings);
    return savedSettings;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      loading,
      signIn,
      signUp,
      signOut,
      notificationSettings,
      saveNotificationSettings,
    }),
    [
      session,
      loading,
      signIn,
      signUp,
      signOut,
      notificationSettings,
      saveNotificationSettings,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
