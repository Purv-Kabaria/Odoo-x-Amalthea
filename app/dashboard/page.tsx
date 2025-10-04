import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { updateUserAction, logoutAction, deleteUserAction } from "@/app/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User as UserIcon, Mail, Calendar, Shield, LogOut, Trash2, Edit } from "lucide-react";
import { DashboardClient } from "@/app/dashboard/dashboard-client";

export default async function DashboardPage() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch  {
    return redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(payload.id).lean();

  if (!user) return redirect("/login");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderator":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500 rounded-full">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Welcome back, {user.name}!</h1>
                <p className="text-blue-600">Manage your account and profile settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRoleBadgeColor(user.role)}>
                <Shield className="h-3 w-3 mr-1" />
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* User Details Card */}
        <Card className="bg-white shadow-lg border border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription className="text-blue-600">
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardClient 
              user={{
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
              }}
              updateUserAction={updateUserAction}
            />
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="bg-white shadow-lg border border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Account Details</span>
            </CardTitle>
            <CardDescription className="text-blue-600">
              View your account information and activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Role</p>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Logout Button */}
          <form action={async () => {
            "use server";
            await logoutAction();
            redirect("/");
          }} className="flex-1">
            <Button type="submit" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>

          {/* Admin Dashboard Link (if admin) */}
          {(user.role === "admin" || user.email?.endsWith("@admin")) && (
            <a 
              href="/admin" 
              className="flex-1"
            >
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </a>
          )}

          {/* Delete Account Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild className="flex-1">
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-900">Delete Account</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                  This will permanently delete your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <form action={async () => {
                    "use server";
                    await deleteUserAction(String(user._id));
                    redirect("/");
                  }}>
                    <Button type="submit" variant="destructive">
                      Yes, Delete Account
                    </Button>
                  </form>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}