import {
  CalendarCheck,
  HeartPulse,
  BarChart,
  Bell,
  LucideIcon,
} from "lucide-react";

export interface CTABadge {
  text: string;
}

export interface CTAHeading {
  title: string;
  subtitle: string;
}

export interface CTAFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface CTAButton {
  text: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface DashboardItem {
  icon: LucideIcon;
  title: string;
  time: string;
  content: string;
}

export interface CTADashboard {
  title: string;
  patientName: string;
  items: DashboardItem[];
}

export interface CTAConfig {
  badge: CTABadge;
  heading: CTAHeading;
  features: CTAFeature[];
  buttons: CTAButton[];
  dashboard: CTADashboard;
}

export const ctaConfig: CTAConfig = {
  badge: {
    text: "Smart Expense Management",
  },
  heading: {
    title: "Streamline Your Company's Expenses with Expensio",
    subtitle:
      "Say goodbye to manual spreadsheets and lost receipts. Expensio automates your entire expense reporting and approval process.",
  },
  features: [
    {
      icon: CalendarCheck,
      title: "Flexible Approval Workflows",
      description:
        "Define multi-level approval chains, set rules based on thresholds, and ensure every expense is reviewed by the right people.",
    },
    {
      icon: HeartPulse,
      title: "Real-time Expense Tracking",
      description:
        "Empower your team to submit expenses on the go and gain full transparency into company spending as it happens.",
    },
  ],
  buttons: [
    {
      text: "Get Started for Free",
      href: "/signup",
      variant: "primary",
    },
    {
      text: "Request a Demo",
      href: "/demo",
      variant: "secondary",
    },
  ],
  dashboard: {
    title: "Your Expense Dashboard",
    patientName: "Welcome, Alex (Admin)",
    items: [
      {
        icon: CalendarCheck,
        title: "New Expense Report from Sarah",
        time: "2 hours ago",
        content:
          "Team lunch for the Q3 project kickoff. Awaiting your approval.",
      },
      {
        icon: BarChart,
        title: "Marketing Dept. Spending Report",
        time: "Yesterday",
        content:
          "The monthly spending report for the Marketing department is ready for review.",
      },
      {
        icon: Bell,
        title: "Policy Reminder: Travel Expenses",
        time: "3 days ago",
        content:
          "A reminder that all international travel expenses require pre-approval from the Finance department.",
      },
    ],
  },
};