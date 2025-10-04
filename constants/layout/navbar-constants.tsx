"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileImage,
  ShieldCheck,
  Users,
  Receipt,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

export type UserRole = "admin" | "employee" | "manager";

const ALL_NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee", "manager"],
  },
  {
    href: "/expenseSubmission",
    label: "Submit Expense",
    icon: Receipt,
    roles: ["admin", "employee"],
  },
  {
    href: "/manager/dashboard",
    label: "Manager Dashboard",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    href: "/admin/dashboard",
    label: "Admin Panel",
    icon: ShieldCheck,
    roles: ["admin"],
  },
];

export const getNavLinks = (userRole: UserRole | null): NavLink[] => {
  if (!userRole) {
    return [];
  }

  return ALL_NAV_LINKS.filter((link) => {
    if (!link.roles || link.roles.length === 0) {
      return true;
    }

    return link.roles.includes(userRole);
  });
};

export const canAccessRoute = (
  route: string,
  userRole: UserRole | null
): boolean => {
  if (!userRole) {
    return false;
  }

  const link = ALL_NAV_LINKS.find((link) => link.href === route);
  if (!link) {
    return false;
  }

  if (!link.roles || link.roles.length === 0) {
    return true;
  }

  return link.roles.includes(userRole);
};

export const NAVBAR = {
  logo: {
    light: "/images/logo-blue.svg",
    dark: "/images/logo-white.svg",
    alt: "Expensio Logo",
    width: 32,
    height: 32,
  },
  name: {
    primary: "Expen",
    secondary: "sio",
  },

  links: ALL_NAV_LINKS,
} as const;
