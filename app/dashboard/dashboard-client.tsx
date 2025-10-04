"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X, Edit} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardClientProps {
  user: User;
  updateUserAction: (userId: string, data: { name?: string; email?: string }) => Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
}

export function DashboardClient({ user, updateUserAction }: DashboardClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
  });
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    startTransition(async () => {
      try {
        await updateUserAction(user.id, {
          name: formData.name.trim(),
        });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground font-sans">
            Full Name
          </Label>
          {isEditing ? (
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="Enter your full name"
              className="border-border focus:border-primary focus:ring-primary/20"
            />
          ) : (
            <div className="p-3 bg-muted rounded-lg border border-border">
              <p className="text-foreground font-medium font-sans">{user.name}</p>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground font-sans">
            Email Address
          </Label>
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-foreground font-medium font-sans">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="border-border text-foreground hover:bg-muted font-sans"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
            >
              {isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
