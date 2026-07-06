"use client";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    ihPilotOpen?: () => void;
  }
}

export function OpenGuideButton({
  children,
  variant = "outline",
  size = "lg",
}: {
  children: React.ReactNode;
  variant?: "outline" | "ghost" | "secondary";
  size?: "md" | "lg" | "xl";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => window.ihPilotOpen?.()}
    >
      {children}
    </Button>
  );
}
