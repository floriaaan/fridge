import React, { createContext, useContext, useRef, ReactNode } from "react";
import ChallengeSnackbar, { ChallengeSnackbarRef } from "@/components/ui/challenge-snackbar";

interface ChallengeSnackbarContextType {
  showProgress: (title: string, progress: number, target: number) => void;
}

const ChallengeSnackbarContext = createContext<ChallengeSnackbarContextType | null>(null);

export function ChallengeSnackbarProvider({ children }: { children: ReactNode }) {
  const snackbarRef = useRef<ChallengeSnackbarRef>(null);

  const showProgress = (title: string, progress: number, target: number) => {
    snackbarRef.current?.show(title, progress, target);
  };

  return (
    <ChallengeSnackbarContext.Provider value={{ showProgress }}>
      {children}
      <ChallengeSnackbar ref={snackbarRef} />
    </ChallengeSnackbarContext.Provider>
  );
}

export function useChallengeSnackbar() {
  const context = useContext(ChallengeSnackbarContext);
  if (!context) {
    throw new Error("useChallengeSnackbar must be used within ChallengeSnackbarProvider");
  }
  return context;
}
