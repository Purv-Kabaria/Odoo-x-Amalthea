import {
  getAllUsersAction,
  getCurrentUserAction,
  deleteUserByAdminAction,
  updateUserRoleAction,
} from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Mail, Calendar, Trash2, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RoleEditor } from "../dashboard/role-editor";

export default async function AdminUsersPage() {
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
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive font-sans">
              Access Denied
            </CardTitle>
            <CardDescription className="text-destructive font-sans">
              You don&apos;t have permission to access this page. Only
              administrators can view user management.
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

  const users = await getAllUsersAction();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
                  User Management
                </h1>
                <p className="text-foreground/70 font-sans">
                  View and manage all user accounts in the system
                </p>
              </div>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center space-x-2 border-border text-foreground hover:bg-muted font-sans">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <Card className="bg-card shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2 font-sans">
              <Users className="h-5 w-5" />
              <span>All Users ({users.length})</span>
            </CardTitle>
            <CardDescription className="text-foreground/70 font-sans">
              Manage user roles and delete user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground font-sans">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground font-sans">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground font-sans">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground font-sans">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground font-sans">
                      Last Updated
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground font-sans">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-sm font-sans">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-foreground font-sans">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground font-sans">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <RoleEditor
                          userId={user.id}
                          currentRole={user.role}
                          userName={user.name}
                          updateUserRoleAction={updateUserRoleAction}
                          isCurrentUser={user.id === currentUser?.id}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground font-sans">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground font-sans">
                            {formatDate(user.updatedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          {/* Don't show delete button for current user */}
                          {user.id !== currentUser?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete user</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-900">
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600">
                                    Are you sure you want to delete{" "}
                                    <strong>{user.name}</strong>? This action
                                    cannot be undone and will permanently remove
                                    the user from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <form
                                      action={async () => {
                                        "use server";
                                        try {
                                          await deleteUserByAdminAction(
                                            user.id
                                          );
                                          // Refresh the page to show updated user list
                                          redirect("/admin/users");
                                        } catch (error) {
                                          console.error(
                                            "Failed to delete user:",
                                            error
                                          );
                                          // Still redirect to refresh the page
                                          redirect("/admin/users");
                                        }
                                      }}
                                    >
                                      <Button
                                        type="submit"
                                        variant="destructive"
                                      >
                                        Yes, Delete User
                                      </Button>
                                    </form>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {/* Show current user indicator */}
                          {user.id === currentUser?.id && (
                            <div className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded font-sans">
                              You
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg font-sans">No users found</p>
                  <p className="text-muted-foreground font-sans">
                    Users will appear here once they register
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
