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
  ArrowLeft,
  CheckSquare,
  UserCheck,
  Crown,
  UserCog,
  Activity,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
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
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-lg p-4 sm:p-6 border border-border animate-in fade-in-50 slide-in-from-top-4 duration-700">
          {/* Back Button */}
          <div className="mb-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-3 bg-primary rounded-xl shadow-md animate-in zoom-in-50 duration-500 delay-200">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground font-sans animate-in slide-in-from-left-4 duration-700 delay-300">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-foreground/70 font-sans animate-in slide-in-from-left-4 duration-700 delay-500">
                Manage and monitor user accounts across your organization
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground/60 animate-in fade-in-50 duration-700 delay-700">
              <Activity className="h-4 w-4" />
              <span>Live Dashboard</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-primary text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-700 delay-100 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 font-sans">
                Total Users
              </CardTitle>
              <div className="p-2 bg-primary-foreground/20 rounded-lg group-hover:bg-primary-foreground/30 transition-colors duration-300">
                <Users className="h-4 w-4 text-primary-foreground/80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-sans animate-in zoom-in-50 duration-500 delay-300">
                {userStats.total}
              </div>
              <p className="text-xs text-primary-foreground/60 font-sans">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-destructive text-destructive-foreground border-0 shadow-lg hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-700 delay-200 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive-foreground/80 font-sans">
                Administrators
              </CardTitle>
              <div className="p-2 bg-destructive-foreground/20 rounded-lg group-hover:bg-destructive-foreground/30 transition-colors duration-300">
                <Crown className="h-4 w-4 text-destructive-foreground/80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-sans animate-in zoom-in-50 duration-500 delay-400">
                {userStats.admins}
              </div>
              <p className="text-xs text-destructive-foreground/60 font-sans">
                Full access users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-700 delay-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90 font-sans">
                Managers
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <UserCog className="h-4 w-4 text-white/90" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-sans animate-in zoom-in-50 duration-500 delay-500">
                {userStats.managers}
              </div>
              <p className="text-xs text-white/70 font-sans">
                Management level access
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-700 delay-400 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90 font-sans">
                Employees
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <UserCheck className="h-4 w-4 text-white/90" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-sans animate-in zoom-in-50 duration-500 delay-600">
                {userStats.employees}
              </div>
              <p className="text-xs text-white/70 font-sans">
                Basic users
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link href="/admin/users">
            <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all cursor-pointer group hover:border-primary/50 hover:-translate-y-1 animate-in slide-in-from-left-4 duration-700 delay-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary rounded-xl group-hover:bg-primary/90 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-primary/80 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-sans">
                  User Management
                </CardTitle>
                <CardDescription className="text-sm text-foreground/70 font-sans">
                  View and manage all user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-foreground/70 font-sans">
                    Total Users:{" "}
                    <span className="font-semibold text-primary">
                      {userStats.total}
                    </span>
                  </div>
                  <div className="text-xs text-primary font-medium font-sans">
                    Manage →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/approvals">
            <Card className="bg-card shadow-lg border border-border hover:shadow-xl transition-all cursor-pointer group hover:border-primary/50 hover:-translate-y-1 animate-in slide-in-from-left-4 duration-700 delay-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-primary rounded-xl group-hover:bg-primary/90 group-hover:scale-110 transition-all duration-300 shadow-md">
                    <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-primary/80 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-sans">
                  Approval Rules
                </CardTitle>
                <CardDescription className="text-sm text-foreground/70 font-sans">
                  Manage approval workflows and expense approval rules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-foreground/70 font-sans">
                    Rules:{" "}
                    <span className="font-semibold text-primary">Active</span>
                  </div>
                  <div className="text-xs text-primary font-medium font-sans">
                    Manage →
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
