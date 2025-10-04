"use client";

import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, FileImage, ShieldCheck } from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
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
  links: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "Upload Receipts", icon: FileImage },
    { href: "/admin/dashboard", label: "Admin Panel", icon: ShieldCheck },
  ] as NavLink[],
} as const;