"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowRight, User, LogOut, Settings, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { NAVBAR, getNavLinks, UserRole } from "@/constants/layout/navbar-constants";
import { getCurrentUserAction, logoutAction } from "@/app/actions/auth";

interface User {
  id: string;
  email: string;
  role: string;
  organization: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUserAction();
        setUser(currentUser as User);
      } catch  {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logoutAction();
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get navigation items based on user role
  const navItems = getNavLinks(user?.role as UserRole).map((link) => {
    const Icon = link.icon;
    return {
      href: link.href,
      label: link.label,
      icon: <Icon className="h-4 w-4" />,
    };
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}>
      <div className="px-4 md:px-6 py-2">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 z-10">
            <Image
              src={scrolled ? NAVBAR.logo.dark : NAVBAR.logo.light}
              alt={NAVBAR.logo.alt}
              width={NAVBAR.logo.width}
              height={NAVBAR.logo.height}
              className="relative"
              priority
            />

            <div className="font-bold text-xl font-serif">
              <span
                className={
                  scrolled ? "text-primary-foreground" : "text-primary"
                }>
                {NAVBAR.name.primary}
              </span>
              <span
                className={
                  scrolled ? "text-primary-foreground" : "text-primary"
                }>
                {NAVBAR.name.secondary}
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} isScrolled={scrolled} />
            ))}
            
            {isLoading ? (
              <div className="w-20 h-9 bg-gray-200 rounded-md animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`transition-all duration-300 shadow-sm rounded-md border-2 ${
                      scrolled
                        ? "border-primary-foreground/20 text-foreground hover:border-primary-foreground/40 hover:bg-primary-foreground/10"
                        : "border-primary/20 text-primary hover:border-primary/40 hover:bg-primary/5"
                    }`}>
                    <User className="h-4 w-4 mr-2" />
                    {user.email.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email.split('@')[0]}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.email?.endsWith("@admin")) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="default"
                className={`transition-all duration-300 shadow-sm rounded-md
      ${
        scrolled
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary-foreground"
          : "bg-primary text-primary-foreground hover:bg-chart-2"
      }`}>
                <Link href="/login">
                  <span className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Login
                  </span>
                </Link>
              </Button>
            )}
          </div>

          <div className="lg:hidden justify-self-end">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    scrolled
                      ? "text-primary-foreground hover:bg-primary-foreground/10"
                      : "text-foreground hover:bg-foreground/10"
                  } transition-all`}>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full max-w-xs border-none bg-background">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="flex items-center p-4 border-b">
                    <div className="font-bold text-xl font-serif">
                      <span className="text-muted-foreground">
                        {NAVBAR.name.primary}
                      </span>
                      <span className="text-primary">
                        {NAVBAR.name.secondary}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <nav className="flex flex-col gap-6">
                      {navItems.map((item, i) => (
                        <MobileNavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          onClick={() => setIsOpen(false)}
                          index={i}
                        />
                      ))}
                      {isLoading ? (
                        <div className="mt-6 w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                      ) : user ? (
                        <div className="mt-6 space-y-3">
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="font-medium text-sm">{user.email.split('@')[0]}</p>
                            <p className="text-xs text-black-500 truncate">{user.email}</p>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full">
                            <Link
                              href="/dashboard"
                              className="flex items-center justify-center gap-2"
                              onClick={() => setIsOpen(false)}>
                              <Settings className="h-4 w-4" />
                              Dashboard
                            </Link>
                          </Button>
                          {(user.role === "admin" || user.email?.endsWith("@admin")) && (
                            <Button
                              asChild
                              variant="outline"
                              className="w-full">
                              <Link
                                href="/admin/dashboard"
                                className="flex items-center justify-center gap-2"
                                onClick={() => setIsOpen(false)}>
                                <Shield className="h-4 w-4" />
                                Admin Panel
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Log out
                          </Button>
                        </div>
                      ) : (
                        <Button
                          asChild
                          variant="default"
                          className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link
                            href="/login"
                            className="flex items-center justify-center gap-2"
                            onClick={() => setIsOpen(false)}>
                            <ArrowRight className="h-4 w-4" />
                            Login
                          </Link>
                        </Button>
                      )}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function NavItem({
  href,
  label,
  icon,
  isScrolled,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isScrolled: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 group px-3 py-2 rounded-md transition-all ${
        isScrolled
          ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          : "text-muted-foreground hover:text-primary hover:bg-foreground/5"
      }`}>
      <div className="transition-colors">{icon}</div>
      <span className="text-sm font-medium transition-colors font-sans">
        {label}
      </span>
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  icon,
  onClick,
  index,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}>
      <Link
        href={href}
        onClick={onClick}
        className="text-base font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-3 group py-2 font-sans">
        <div className="text-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        {label}
      </Link>
    </motion.div>
  );
}
