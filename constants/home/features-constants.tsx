"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  BellRing,
  LineChart,
  BarChart,
  MessageSquareHeart,
  ShieldCheck,
  FileText,
  Users,
} from "lucide-react";

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES_CONTENT = {
  id: "features",
  eyebrow: "Features",
  title: "A Complete Toolkit for Modern Expense Management",
  description:
    "Discover how Expensio's powerful features can simplify expense reporting for your entire organization, from submission to reimbursement.",
  items: [
    {
      icon: CalendarClock,
      title: "Automated Approval Flows",
      description:
        "Create multi-step approval chains that automatically route expenses to the right managers, departments, or finance teams. No more chasing signatures.",
    },
    {
      icon: FileText,
      title: "OCR Receipt Scanning",
      description:
        "Eliminate manual data entry. Just snap a photo of a receipt, and our OCR technology will automatically extract the vendor, date, amount, and more.",
    },
    {
      icon: LineChart,
      title: "Insightful Analytics & Reporting",
      description:
        "Gain a clear view of company spending with powerful dashboards. Track expenses by category, department, or employee to make smarter budget decisions.",
    },
    {
      icon: BarChart,
      title: "Customizable Expense Policies",
      description:
        "Define your company's spending rules and thresholds. Expensio automatically flags out-of-policy expenses for review, ensuring compliance.",
    },
    {
      icon: MessageSquareHeart,
      title: "Clear Communication",
      description:
        "Managers can approve, reject, or add comments directly to expense submissions, providing clear feedback to employees and reducing back-and-forth emails.",
    },
    {
      icon: BellRing,
      title: "Real-time Notifications",
      description:
        "Stay informed with instant notifications for expense submissions, approvals, and rejections. Keep the process moving without delay.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Compliant",
      description:
        "Your financial data is safe with us. We ensure top-tier security and help you maintain a clear, compliant audit trail for all expenses.",
    },
    {
      icon: Users,
      title: "User & Role Management",
      description:
        "Easily manage your team with distinct roles for Employees, Managers, and Admins. Define manager-employee relationships for a seamless approval hierarchy.",
    },
  ] as FeatureItem[],
} as const;