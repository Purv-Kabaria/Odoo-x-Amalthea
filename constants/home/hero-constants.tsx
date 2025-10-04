"use client";

import type { LucideIcon } from "lucide-react";
import { Users, Calendar, Heart, ShieldCheck } from "lucide-react";

export type HeroHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const HERO_CONTENT = {
  id: "hero",
  headline: {
    primary: "Effortless Expense",
    secondary: "Management.",
  },
  description:
    "Stop chasing receipts and wrestling with spreadsheets. Expensio automates your expense reporting process, so you can focus on what matters.",
  ctas: {
    primary: { href: "/signup", label: "Start Your Free Trial" },
    secondary: { href: "/demo", label: "Book a Demo" },
  },
  highlights: [
    { icon: Users, title: "50+", description: "Companies Streamlined" },
    { icon: Calendar, title: "10K+", description: "Expenses Processed Monthly" },
    { icon: Heart, title: "95%", description: "Happier Finance Teams" },
    { icon: ShieldCheck, title: "100%", description: "Policy Compliance" },
  ] as HeroHighlight[],
} as const;