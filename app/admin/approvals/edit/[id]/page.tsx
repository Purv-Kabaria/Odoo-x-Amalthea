import { getCurrentUserAction } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/mongoose";
import ApprovalRule from "@/models/ApprovalRules";
import AdminApprovalRuleForm from "@/components/admin-approval/AdminApprovalForm";

interface EditApprovalRulePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApprovalRulePage({
  params,
}: EditApprovalRulePageProps) {
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
            <p className="text-red-600">
              You don&apos;t have permission to access this page. Only
              administrators can edit approval rules.
            </p>
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

  // Fetch the approval rule to edit
  let approvalRule = null;
  try {
    await connectToDatabase();
    const { id } = await params;
    approvalRule = await ApprovalRule.findById(id)
      .populate("appliesToUser", "name email")
      .populate("manager", "name email")
      .populate("approvers.user", "name email");
  } catch (error) {
    console.error("Error fetching approval rule:", error);
  }

  if (!approvalRule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <Card className="bg-white shadow-lg border border-red-200 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-red-900">
              Rule Not Found
            </CardTitle>
            <p className="text-red-600">
              The approval rule you&apos;re looking for doesn&apos;t exist or
              has been deleted.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/admin/approvals"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Approval Rules
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminApprovalRuleForm
          currentUserOrganization={currentUser.organization}
          editMode={true}
          ruleId={(await params).id}
          initialData={{
            ruleName: approvalRule.ruleName || "",
            description: approvalRule.description || "",
            appliesToUser: approvalRule.appliesToUser?._id?.toString() || "",
            manager: approvalRule.manager?._id?.toString() || "",
            isManagerApprover: approvalRule.isManagerApprover || false,
            approverSequence: approvalRule.approverSequence || false,
            minApprovalPercent: approvalRule.minApprovalPercent || 100,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            approvers: approvalRule.approvers.map((approver: any) => ({
              user: approver.user._id.toString(),
              required: approver.required || false,
              sequenceNo: approver.sequenceNo || 0,
              autoApprove: approver.autoApprove || false,
            })),
          }}
        />
      </div>
    </div>
  );
}
