import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  LucideIcon,
} from "lucide-react";

export interface SocialLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface ContactInfo {
  address: {
    line1: string;
    line2: string;
    line3: string;
  };
  email: string;
  phone: string;
}

export interface FooterConfig {
  companyName: {
    primary: string;
    secondary: string;
  };
  tagline: string;
  socialLinks: SocialLink[];
  sections: FooterSection[];
  contactInfo: ContactInfo;
  legal: {
    copyrightText: string;
    links: FooterLink[];
  };
}

export const footerConfig: FooterConfig = {
  companyName: {
    primary: "Expen",
    secondary: "sio",
  },
  tagline: "Automating expense management, from submission to reimbursement.",
  socialLinks: [
    {
      href: "https://facebook.com",
      icon: Facebook,
      label: "Facebook",
    },
    {
      href: "https://twitter.com",
      icon: Twitter,
      label: "Twitter",
    },
    {
      href: "https://instagram.com",
      icon: Instagram,
      label: "Instagram",
    },
    {
      href: "https://linkedin.com",
      icon: Linkedin,
      label: "LinkedIn",
    },
  ],
  sections: [
    {
      title: "Product",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/#cta", label: "Get Started" },
        { href: "/#testimonials", label: "Reviews" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/admin/dashboard", label: "Admin Dashboard" },
      ],
    },
  ],
  contactInfo: {
    address: {
      line1: "SVNIT",
      line2: "Surat, Gujarat",
      line3: "",
    },
    email: "contact@expensio.com",
    phone: "+91 12345 67890",
  },
  legal: {
    copyrightText: "SVNIT. All rights reserved.",
    links: [
    ],
  },
};