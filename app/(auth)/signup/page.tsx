"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate name
    if (!form.name.trim()) {
      toast.error("Name is required", {
        description: "Please enter your full name.",
      });
      return;
    }

    // Validate email
    if (!form.email.trim()) {
      toast.error("Email is required", {
        description: "Please enter your email address.",
      });
      return;
    }

    if (!validateEmail(form.email)) {
      toast.error("Please enter a valid email address", {
        description: "Email format should be like: user@example.com",
      });
      return;
    }

    // Validate organization
    if (!form.organization.trim()) {
      toast.error("Organization name is required", {
        description: "Please enter your organization name.",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      toast.error("Password does not meet requirements", {
        description: "Please check the password requirements below.",
      });
      return;
    }

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please make sure both password fields are identical.",
      });
      return;
    }

    setLoading(true);
    setPasswordErrors([]);

    try {
      const user = await signUpAction({
        name: form.name,
        email: form.email,
        password: form.password,
        organization: form.organization,
      });

      toast.success("Account created successfully!", {
        description: `Welcome to Amalthea, ${user.name}!`,
        duration: 4000,
      });

      // Redirect based on user role
      if (user.role === "admin" || user.email?.endsWith("@admin")) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      toast.error(errorMessage, {
        description: "Please check your information and try again.",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Organization Name
                </label>
                <Input
                  value={form.organization}
                  onChange={(e) =>
                    setForm({ ...form, organization: e.target.value })
                  }
                  placeholder="Your organization name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (e.target.value) {
                      const validation = validatePassword(e.target.value);
                      setPasswordErrors(validation.errors);
                    } else {
                      setPasswordErrors([]);
                    }
                  }}
                  placeholder="Choose a strong password"
                  required
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
