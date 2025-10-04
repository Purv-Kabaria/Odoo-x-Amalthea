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
        { href: "/pricing", label: "Pricing" },
        { href: "/demo", label: "Book a Demo" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/careers", label: "Careers" },
      ],
    },
  ],
  contactInfo: {
    address: {
      line1: "123 Finance Ave",
      line2: "Business City, 12345",
      line3: "",
    },
    email: "contact@expensio.com",
    phone: "+1 (555) 123-4567",
  },
  legal: {
    copyrightText: "Expensio. All rights reserved.",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
};