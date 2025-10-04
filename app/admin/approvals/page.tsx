import { getCurrentUserAction } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Settings,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/mongoose";
import ApprovalRule from "@/models/ApprovalRules";

// Types for populated fields
interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

// Type guard to check if user is populated
function isPopulatedUser(user: unknown): user is PopulatedUser {
  return Boolean(
    user && typeof user === "object" && "name" in user && "email" in user
  );
}

export default async function AdminApprovalsPage() {
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
              administrators can view approval rules.
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

  // Fetch approval rules from database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let approvalRules: any[] = [];
  try {
    await connectToDatabase();
    approvalRules = await ApprovalRule.find()
      .populate("appliesToUser", "name email")
      .populate("manager", "name email")
      .populate("approvers.user", "name email")
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching approval rules:", error);
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-900">
                  Approval Rules
                </h1>
                <p className="text-green-600">
                  Manage expense approval workflows and rules
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <Link href="/admin/admin-approval">
                <Button className="flex items-center space-x-2 bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4" />
                  <span>Create Rule</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Total Rules
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRules.length}</div>
              <p className="text-xs text-green-200">Active approval rules</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                With Approvers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  approvalRules.filter((rule) => rule.approvers.length > 0)
                    .length
                }
              </div>
              <p className="text-xs text-blue-200">Rules with approvers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Sequential Rules
              </CardTitle>
              <Settings className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {approvalRules.filter((rule) => rule.approverSequence).length}
              </div>
              <p className="text-xs text-purple-200">
                Sequential approval rules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Rules List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              All Approval Rules
            </h2>
            <Badge variant="outline" className="text-sm">
              {approvalRules.length} rules
            </Badge>
          </div>

          {approvalRules.length === 0 ? (
            <Card className="bg-white shadow-lg border border-gray-200">
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Approval Rules Found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first approval rule
                </p>
                <Link href="/admin/admin-approval">
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create First Rule</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvalRules.map((rule) => (
                <Card
                  key={rule._id}
                  className="bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                          {rule.ruleName || "Unnamed Rule"}
                        </CardTitle>
                        <CardDescription className="text-gray-600 mb-3">
                          {rule.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.organization}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rule Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Min Approval:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {rule.minApprovalPercent}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Approvers:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {rule.approvers.length}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Manager Approver:
                        </span>
                        <Badge
                          variant={
                            rule.isManagerApprover ? "default" : "secondary"
                          }
                          className="ml-2 text-xs"
                        >
                          {rule.isManagerApprover ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Sequential:
                        </span>
                        <Badge
                          variant={
                            rule.approverSequence ? "default" : "secondary"
                          }
                          className="ml-2 text-xs"
                        >
                          {rule.approverSequence ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>

                    {/* User Assignment */}
                    <div className="space-y-2">
                      {rule.appliesToUser &&
                        isPopulatedUser(rule.appliesToUser) && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-700">
                              Applies to:
                            </span>
                            <span className="text-gray-600">
                              {rule.appliesToUser.name}
                            </span>
                          </div>
                        )}
                      {rule.manager && isPopulatedUser(rule.manager) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-700">
                            Manager:
                          </span>
                          <span className="text-gray-600">
                            {rule.manager.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Approvers List */}
                    {rule.approvers.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-medium text-gray-700 text-sm">
                          Approvers:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rule.approvers.map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (approver: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {isPopulatedUser(approver.user)
                                  ? approver.user.name
                                  : "Unknown User"}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Created: {formatDate(rule.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <Link href={`/admin/approvals/edit/${rule._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
