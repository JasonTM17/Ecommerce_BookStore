"use client";

import { useReportWebVitals } from "next/web-vitals";
import { logWebVitalMetric } from "@/lib/monitoring";

export function WebVitals() {
  useReportWebVitals(logWebVitalMetric);
  return null;
}
