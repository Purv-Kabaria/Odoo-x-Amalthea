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
  updateUserRoleAction: (userId: string, newRole: "admin" | "employee" | "manager") => Promise<{
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
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "manager":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "employee":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
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
        await updateUserRoleAction(userId, selectedRole as "admin" | "employee" | "manager");
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
        <span className="text-xs text-muted-foreground font-sans">(You)</span>
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
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="h-8 w-8 p-0 border-border text-foreground hover:bg-muted">
          <X className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground">
          {isPending ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground"></div>
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
        className="h-6 w-6 p-0 hover:bg-muted">
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
}
