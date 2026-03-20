import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "../store/useAppStore";
import { CompanionScreen } from "../components/CompanionScreen";

export function CompanionPage() {
  const companionName = useAppStore((s) => s.companionName);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!companionName) {
      navigate("/");
    }
  }, [companionName, navigate]);

  if (!companionName) return null;

  return <CompanionScreen />;
}
