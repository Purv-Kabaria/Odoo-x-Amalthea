"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

interface RoleEditorProps {
  userId: string;
  currentRole: string;
  userName: string;
  updateUserRoleAction: (userId: string, newRole: "user" | "admin" | "moderator") => Promise<{
    success: boolean;
    updatedUser: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  isCurrentUser?: boolean;
}

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

export function RoleEditor({ 
  userId, 
  currentRole, 
  userName, 
  updateUserRoleAction, 
  isCurrentUser = false 
}: RoleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (selectedRole === currentRole) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, selectedRole as "user" | "admin" | "moderator");
        toast.success(`Role updated successfully for ${userName}!`);
        setIsEditing(false);
        // Refresh the page to show updated role
        window.location.reload();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update role");
      }
    });
  };

  const handleCancel = () => {
    setSelectedRole(currentRole);
    setIsEditing(false);
  };

  if (isCurrentUser) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={getRoleBadgeColor(currentRole)}>
          {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
        </Badge>
        <span className="text-xs text-gray-500">(You)</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="h-8 w-8 p-0">
          <X className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700">
          {isPending ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          ) : (
            <Check className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge className={getRoleBadgeColor(currentRole)}>
        {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
      </Badge>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 hover:bg-gray-100">
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
}
