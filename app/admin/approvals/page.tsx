import { getCurrentUserAction, deleteApprovalRuleAction } from "@/app/actions/auth";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
              administrators can view approval rules.
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

  // Fetch approval rules from database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let approvalRules: any[] = [];
  try {
    await connectToDatabase();
    approvalRules = await ApprovalRule.find({ organization: currentUser.organization })
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <CheckSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans">
                  Approval Rules
                </h1>
                <p className="text-foreground/70 font-sans">
                  Manage expense approval workflows and rules
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 border-border text-foreground hover:bg-muted font-sans"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <Link href="/admin/admin-approval">
                <Button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground font-sans">
                  <Plus className="h-4 w-4" />
                  <span>Create Rule</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 font-sans">
                Total Rules
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{approvalRules.length}</div>
              <p className="text-xs text-primary-foreground/60 font-sans">Active approval rules</p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 font-sans">
                With Approvers
              </CardTitle>
              <Users className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {
                  approvalRules.filter((rule) => rule.approvers.length > 0)
                    .length
                }
              </div>
              <p className="text-xs text-primary-foreground/60 font-sans">Rules with approvers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 font-sans">
                Sequential Rules
              </CardTitle>
              <Settings className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {approvalRules.filter((rule) => rule.approverSequence).length}
              </div>
              <p className="text-xs text-primary-foreground/60 font-sans">
                Sequential approval rules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Rules List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground font-sans">
              All Approval Rules
            </h2>
            <Badge variant="outline" className="text-sm font-sans">
              {approvalRules.length} rules
            </Badge>
          </div>

          {approvalRules.length === 0 ? (
            <Card className="bg-card shadow-lg border border-border">
              <CardContent className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2 font-sans">
                  No Approval Rules Found
                </h3>
                <p className="text-muted-foreground mb-6 font-sans">
                  Get started by creating your first approval rule
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvalRules.map((rule) => (
                <Card
                  key={rule._id}
                  className="bg-card shadow-lg border border-border hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-foreground mb-2 font-sans">
                          {rule.ruleName || "Unnamed Rule"}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mb-3 font-sans">
                          {rule.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs font-sans">
                          {rule.organization}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rule Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground font-sans">
                          Min Approval:
                        </span>
                        <span className="ml-2 text-muted-foreground font-sans">
                          {rule.minApprovalPercent}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground font-sans">
                          Approvers:
                        </span>
                        <span className="ml-2 text-muted-foreground font-sans">
                          {rule.approvers.length}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground font-sans">
                          Manager Approver:
                        </span>
                        <Badge
                          variant={
                            rule.isManagerApprover ? "default" : "secondary"
                          }
                          className="ml-2 text-xs font-sans"
                        >
                          {rule.isManagerApprover ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-foreground font-sans">
                          Sequential:
                        </span>
                        <Badge
                          variant={
                            rule.approverSequence ? "default" : "secondary"
                          }
                          className="ml-2 text-xs font-sans"
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
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium text-foreground font-sans">
                              Applies to:
                            </span>
                            <span className="text-muted-foreground font-sans">
                              {rule.appliesToUser.name}
                            </span>
                          </div>
                        )}
                      {rule.manager && isPopulatedUser(rule.manager) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-foreground font-sans">
                            Manager:
                          </span>
                          <span className="text-muted-foreground font-sans">
                            {rule.manager.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Approvers List */}
                    {rule.approvers.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-medium text-foreground text-sm font-sans">
                          Approvers:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rule.approvers.map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (approver: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs font-sans"
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
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border font-sans">
                      Created: {formatDate(rule.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <Link href={`/admin/approvals/edit/${rule._id}`}>
                        <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted font-sans">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive/80 border-destructive/20 hover:bg-destructive/10 font-sans"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive font-sans">Delete Approval Rule</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground font-sans">
                              Are you absolutely sure you want to delete the approval rule &quot;{rule.ruleName || "Unnamed Rule"}&quot;? 
                              This action cannot be undone and will permanently remove the rule from your organization.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
                            <form action={async () => {
                              "use server";
                              try {
                                await deleteApprovalRuleAction(String(rule._id));
                                redirect("/admin/approvals");
                              } catch (error) {
                                console.error("Failed to delete approval rule:", error);
                                throw error;
                              }
                            }}>
                              <Button 
                                type="submit" 
                                variant="destructive"
                                className="font-sans"
                              >
                                Yes, Delete Rule
                              </Button>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
