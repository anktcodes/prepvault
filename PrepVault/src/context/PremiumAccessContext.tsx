import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { supabase } from "../lib/supabase";

type PremiumStatus = "loading" | "paid" | "unpaid" | "error";

type PremiumContextType = {
  status: PremiumStatus;
  refreshPremiumAccess: () => Promise<void>;
};

const PremiumAccessContext = createContext<PremiumContextType | undefined>(
  undefined,
);

type Props = {
  userId: string | null;
  enabled: boolean;
  children: ReactNode;
};

export function PremiumAccessProvider({ userId, enabled, children }: Props) {
  const [status, setStatus] = useState<PremiumStatus>("loading");

  const refreshPremiumAccess = useCallback(async () => {
    if (!userId || !enabled) {
      setStatus("loading");
      return;
    }

    try {
      setStatus("loading");

      const { data, error } = await supabase
        .from("user_access")
        .select("is_paid")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      setStatus(data?.is_paid === true ? "paid" : "unpaid");
    } catch (error) {
      console.error("Premium access check failed:", error);
      setStatus("error");
    }
  }, [userId, enabled]);

  useEffect(() => {
    if (!userId || !enabled) {
      setStatus("loading");
      return;
    }

    refreshPremiumAccess();
  }, [userId, enabled, refreshPremiumAccess]);

  return (
    <PremiumAccessContext.Provider value={{ status, refreshPremiumAccess }}>
      {children}
    </PremiumAccessContext.Provider>
  );
}

export function usePremiumAccess() {
  const context = useContext(PremiumAccessContext);

  if (!context) {
    throw new Error(
      "usePremiumAccess must be used inside PremiumAccessProvider",
    );
  }

  return context;
}
