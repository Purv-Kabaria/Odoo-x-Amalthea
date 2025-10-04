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
import { User as UserIcon, Mail, Calendar, Shield, LogOut, Trash2, Edit, ArrowLeft } from "lucide-react";
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
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "moderator":
        return "bg-accent text-accent-foreground border-accent/20";
      case "user":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
          {/* Back Button */}
          <div className="mb-4">
            <a 
              href="/"
              className="inline-flex items-center space-x-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Home</span>
            </a>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary rounded-full">
                <UserIcon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans">Welcome back, {user.name}!</h1>
                <p className="text-foreground/70 font-sans">Manage your account and profile settings</p>
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
        <Card className="bg-card shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2 font-sans">
              <Edit className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription className="text-foreground/70 font-sans">
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
        <Card className="bg-card shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2 font-sans">
              <Mail className="h-5 w-5" />
              <span>Account Details</span>
            </CardTitle>
            <CardDescription className="text-foreground/70 font-sans">
              View your account information and activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Email Address</p>
                  <p className="text-foreground font-sans">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Account Role</p>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Member Since</p>
                  <p className="text-foreground font-sans">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-sans">Last Updated</p>
                  <p className="text-foreground font-sans">{formatDate(user.updatedAt)}</p>
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
            <Button type="submit" variant="outline" className="w-full border-border text-foreground hover:bg-muted font-sans">
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
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted font-sans">
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Button>
            </a>
          )}

          {/* Delete Account Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild className="flex-1">
              <Button variant="destructive" className="w-full font-sans">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive font-sans">Delete Account</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground font-sans">
                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                  This will permanently delete your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <form action={async () => {
                    "use server";
                    await deleteUserAction(String(user._id));
                    redirect("/");
                  }}>
                    <Button type="submit" variant="destructive" className="font-sans">
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