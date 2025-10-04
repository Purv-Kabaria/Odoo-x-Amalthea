import { getAllUsersAction, getCurrentUserAction, deleteUserByAdminAction, updateUserRoleAction } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Shield, Mail, Calendar, AlertCircle, Trash2} from "lucide-react";
import { redirect } from "next/navigation";
import { RoleEditor } from "./role-editor";

export default async function AdminDashboard() {
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
            <CardTitle className="text-xl font-bold text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              You don&apos;t have permission to access this page. Only administrators can view the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const users = await getAllUsersAction();

  const userStats = {
    total: users.length,
    admins: users.filter(user => user.role === "admin").length,
    moderators: users.filter(user => user.role === "moderator").length,
    regularUsers: users.filter(user => user.role === "user").length,
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
              <p className="text-blue-600">Manage and monitor user accounts</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-blue-200">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">
                Administrators
              </CardTitle>
              <Shield className="h-4 w-4 text-red-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.admins}</div>
              <p className="text-xs text-red-200">
                Full access users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-100">
                Moderators
              </CardTitle>
              <Shield className="h-4 w-4 text-yellow-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.moderators}</div>
              <p className="text-xs text-yellow-200">
                Limited admin access
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Regular Users
              </CardTitle>
              <Users className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.regularUsers}</div>
              <p className="text-xs text-green-200">
                Standard users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white shadow-lg border border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </CardTitle>
            <CardDescription className="text-blue-600">
              View and manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Last Updated</th>
                    <th className="text-center py-3 px-4 font-semibold text-blue-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-blue-100 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">{user.email}</span>
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
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700">{formatDate(user.updatedAt)}</span>
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
                                  className="h-8 w-8 p-0 hover:bg-red-600">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete user</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-900">Delete User</AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600">
                                    Are you sure you want to delete <strong>{user.name}</strong>? 
                                    This action cannot be undone and will permanently remove the user from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <form action={async () => {
                                      "use server";
                                      try {
                                        await deleteUserByAdminAction(user.id);
                                        // Refresh the page to show updated user list
                                        redirect("/admin/dashboard");
                                      } catch (error) {
                                        console.error("Failed to delete user:", error);
                                        // Still redirect to refresh the page
                                        redirect("/admin/dashboard");
                                      }
                                    }}>
                                      <Button type="submit" variant="destructive">
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
                            <div className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
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
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No users found</p>
                  <p className="text-gray-400">Users will appear here once they register</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
