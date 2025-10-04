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
  // Check if user is authenticated and has admin role
  const currentUser = await getCurrentUserAction();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <Card className="bg-white shadow-lg border border-red-200 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-red-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You don&apos;t have permission to access this page. Only
              administrators can manage approval rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  Approval Rules Management
                </h1>
                <p className="text-blue-600">
                  Create and configure approval rules for expense management
                </p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <button className="flex items-center space-x-2 px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
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
