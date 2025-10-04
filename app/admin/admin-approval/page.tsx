import { getCurrentUserAction } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, AlertCircle, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminApprovalRuleForm from "@/components/admin-approval/AdminApprovalForm";

export default async function AdminApprovalPage() {
  const currentUser = await getCurrentUserAction();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-6">
        <Card className="bg-card shadow-lg border border-destructive/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive font-sans">
              Access Denied
            </CardTitle>
            <CardDescription className="text-destructive font-sans">
              You don&apos;t have permission to access this page. Only
              administrators can manage approval rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-sans"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans">
                  Approval Rules Management
                </h1>
                <p className="text-foreground/70 font-sans">
                  Create and configure approval rules for expense management
                </p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <button className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground font-sans">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Approval Rules Form */}
        <AdminApprovalRuleForm
          currentUserOrganization={currentUser.organization}
        />
      </div>
    </div>
  );
}
