import { getAllUsersAction, getCurrentUserAction } from "@/app/actions/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Shield,
  AlertCircle,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

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
            <CardTitle className="text-xl font-bold text-red-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              You don&apos;t have permission to access this page. Only
              administrators can view the admin dashboard.
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
    admins: users.filter((user) => user.role === "admin").length,
    managers: users.filter((user) => user.role === "manager").length,
    employees: users.filter((user) => user.role === "employee").length,
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
              <h1 className="text-3xl font-bold text-blue-900">
                Admin Dashboard
              </h1>
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
              <p className="text-xs text-blue-200">All registered users</p>
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
              <p className="text-xs text-red-200">Full access users</p>
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
              <div className="text-2xl font-bold">{userStats.managers}</div>
              <p className="text-xs text-yellow-200">Management level access</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Employees
              </CardTitle>
              <Users className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.employees}</div>
              <p className="text-xs text-green-200">Basic users</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="bg-white shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-200 cursor-pointer group hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <CardTitle className="text-lg font-bold text-blue-900 group-hover:text-blue-800 transition-colors">
                  User Management
                </CardTitle>
                <CardDescription className="text-blue-600">
                  View and manage all user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total Users:{" "}
                    <span className="font-semibold text-blue-600">
                      {userStats.total}
                    </span>
                  </div>
                  <div className="text-xs text-blue-500 font-medium">
                    Manage →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/approvals">
            <Card className="bg-white shadow-lg border border-green-200 hover:shadow-xl transition-all duration-200 cursor-pointer group hover:border-green-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-green-500 group-hover:text-green-600 transition-colors" />
                </div>
                <CardTitle className="text-lg font-bold text-green-900 group-hover:text-green-800 transition-colors">
                  Approval Rules
                </CardTitle>
                <CardDescription className="text-green-600">
                  Manage approval workflows and expense approval rules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Rules:{" "}
                    <span className="font-semibold text-green-600">Active</span>
                  </div>
                  <div className="text-xs text-green-500 font-medium">
                    Manage →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Placeholder for future admin features */}
          <Card className="bg-white shadow-lg border border-gray-200 opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-400 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-600">
                System Settings
              </CardTitle>
              <CardDescription className="text-gray-500">
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-500">Coming Soon</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border border-gray-200 opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gray-400 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-gray-600">
                Reports & Analytics
              </CardTitle>
              <CardDescription className="text-gray-500">
                View system reports and user activity analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-gray-500">Coming Soon</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
