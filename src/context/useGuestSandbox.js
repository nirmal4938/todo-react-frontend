import { useContext } from "react";
import { GuestSandboxContext } from "./guestSandboxContextValue";

export function useGuestSandbox() {
  const context = useContext(GuestSandboxContext);
  if (!context) {
    throw new Error(
      "useGuestSandbox must be used within a GuestSandboxProvider",
    );
  }
  return context;
}
