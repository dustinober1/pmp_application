/**
 * OpenTelemetry Provider Component
 *
 * Initializes tracing for the browser environment
 * Place in _app.tsx or layout.tsx
 */

/* eslint-disable @typescript-eslint/no-var-requires -- Dynamic requires for event handlers */

"use client";

import { useEffect } from "react";
import { initializeTracing } from "./opentelemetry";

export function OpenTelemetryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize tracing on mount
    initializeTracing();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const { addEvent } = require("./opentelemetry");
        addEvent("page.visible");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Track page unload
    const handleBeforeUnload = () => {
      const { addEvent } = require("./opentelemetry");
      addEvent("page.unload");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}
