// /components/AdminApprovalRuleForm.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ApproverFormData {
  user: string;
  required: boolean;
  sequenceNo: number;
  autoApprove: boolean;
}

interface ApprovalRuleFormData {
  ruleName: string;
  description: string;
  appliesToUser: string;
  manager: string;
  isManagerApprover: boolean;
  approverSequence: boolean;
  minApprovalPercent: number;
  approvers: ApproverFormData[];
}

interface AdminApprovalRuleFormProps {
  currentUserOrganization?: string;
  editMode?: boolean;
  ruleId?: string;
  initialData?: ApprovalRuleFormData;
}

export default function AdminApprovalRuleForm({
  currentUserOrganization,
  editMode = false,
  ruleId,
  initialData,
}: AdminApprovalRuleFormProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 3;

  // Step validation states
  const [stepValidation, setStepValidation] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApprovalRuleFormData>({
    defaultValues: initialData || {
      ruleName: "",
      description: "",
      appliesToUser: "",
      manager: "",
      isManagerApprover: false,
      approverSequence: false,
      minApprovalPercent: 100,
      approvers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "approvers",
  });

  const approverSequence = watch("approverSequence");

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  // Step validation functions
  const validateStep1 = useCallback(() => {
    const ruleName = watch("ruleName");
    const minApprovalPercent = watch("minApprovalPercent");
    const isValid = Boolean(
      ruleName && ruleName.trim() !== "" && minApprovalPercent !== undefined
    );
    setStepValidation((prev) => ({ ...prev, step1: isValid }));
    return isValid;
  }, [watch]);

  const validateStep2 = useCallback(() => {
    const appliesToUser = watch("appliesToUser");
    const manager = watch("manager");
    const isValid = Boolean(appliesToUser && manager);
    setStepValidation((prev) => ({ ...prev, step2: isValid }));
    return isValid;
  }, [watch]);

  const validateStep3 = useCallback(() => {
    const approvers = watch("approvers");
    const isValid = Boolean(approvers && approvers.length > 0);
    setStepValidation((prev) => ({ ...prev, step3: isValid }));
    return isValid;
  }, [watch]);

  // Watch form values for validation
  const ruleName = watch("ruleName");
  const minApprovalPercent = watch("minApprovalPercent");
  const appliesToUser = watch("appliesToUser");
  const manager = watch("manager");
  const approvers = watch("approvers");

  // Auto-validate steps when form data changes
  useEffect(() => {
    validateStep1();
  }, [ruleName, minApprovalPercent, validateStep1]);

  useEffect(() => {
    validateStep2();
  }, [appliesToUser, manager, validateStep2]);

  useEffect(() => {
    validateStep3();
  }, [approvers, validateStep3]);

  // Populate form fields when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      // Set all form values
      setValue("ruleName", initialData.ruleName);
      setValue("description", initialData.description);
      setValue("appliesToUser", initialData.appliesToUser);
      setValue("manager", initialData.manager);
      setValue("isManagerApprover", initialData.isManagerApprover);
      setValue("approverSequence", initialData.approverSequence);
      setValue("minApprovalPercent", initialData.minApprovalPercent);

      // Clear existing approvers and add the initial ones
      if (initialData.approvers && initialData.approvers.length > 0) {
        // Remove all existing approvers
        for (let i = fields.length - 1; i >= 0; i--) {
          remove(i);
        }

        // Add initial approvers
        initialData.approvers.forEach((approver) => {
          append(approver);
        });
      }
    }
  }, [editMode, initialData, setValue, fields.length, remove, append]);

  // Mark step as completed when moving to next step
  const handleNextStep = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      nextStep();
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const baseUrl = currentUserOrganization
          ? `/api/users?organization=${encodeURIComponent(
              currentUserOrganization
            )}`
          : "/api/users";

        // Fetch all users
        const allUsersResponse = await fetch(baseUrl);
        if (allUsersResponse.ok) {
          const allUsersData = await allUsersResponse.json();
          setAllUsers(allUsersData);
        }

        // Fetch employees only
        const employeesUrl = `${baseUrl}&role=employee`;
        const employeesResponse = await fetch(employeesUrl);
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setEmployees(employeesData);
        }

        // Fetch managers only
        const managersUrl = `${baseUrl}&role=manager`;
        const managersResponse = await fetch(managersUrl);
        if (managersResponse.ok) {
          const managersData = await managersResponse.json();
          setManagers(managersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUserOrganization]);

  const onSubmit = async (data: ApprovalRuleFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const url = editMode
        ? `/api/approval-rules/${ruleId}`
        : "/api/approval-rules";

      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          organization: currentUserOrganization,
        }),
      });

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: editMode
            ? "Approval rule updated successfully!"
            : "Approval rule created successfully!",
        });

        if (!editMode) {
          reset();
          // Redirect to approvals page after successful creation
          setTimeout(() => {
            window.location.href = "/admin/approvals";
          }, 1500);
        } else {
          // Redirect to approvals page after successful update
          setTimeout(() => {
            window.location.href = "/admin/approvals";
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setSubmitMessage({
          type: "error",
          text:
            errorData.error ||
            `Failed to ${editMode ? "update" : "create"} approval rule`,
        });
      }
    } catch {
      setSubmitMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addApprover = () => {
    append({
      user: "",
      required: false,
      sequenceNo: fields.length,
      autoApprove: false,
    });
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => goToStep(step)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                currentStep === step
                  ? "border-blue-500 bg-blue-500 text-white"
                  : completedSteps.includes(step)
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-300 bg-white text-gray-500"
              } ${
                step <= currentStep || completedSteps.includes(step)
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              {completedSteps.includes(step) ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </button>
            {step < 3 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  completedSteps.includes(step) ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span className={currentStep === 1 ? "font-medium text-blue-600" : ""}>
          Basic Info
        </span>
        <span className={currentStep === 2 ? "font-medium text-blue-600" : ""}>
          User Assignment
        </span>
        <span className={currentStep === 3 ? "font-medium text-blue-600" : ""}>
          Approvers
        </span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {editMode ? "Edit Approval Rule" : "Create Approval Rule"}
              </CardTitle>
              <CardDescription>
                {editMode
                  ? "Update the approval rule configuration"
                  : "Configure approval rules for expense management workflow"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <StepIndicator />
        </CardContent>
      </Card>
      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Define the core details of your approval rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Rule Name *</Label>
                  <Input
                    id="ruleName"
                    {...register("ruleName", {
                      required: "Rule name is required",
                    })}
                    placeholder="Enter rule name"
                  />
                  {errors.ruleName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.ruleName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minApprovalPercent">
                    Minimum Approval Percentage
                  </Label>
                  <Input
                    id="minApprovalPercent"
                    type="number"
                    min="0"
                    max="100"
                    {...register("minApprovalPercent", {
                      required: "Minimum approval percentage is required",
                      min: { value: 0, message: "Must be at least 0" },
                      max: { value: 100, message: "Must be at most 100" },
                    })}
                  />
                  {errors.minApprovalPercent && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.minApprovalPercent.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter rule description"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Approval Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isManagerApprover"
                      checked={watch("isManagerApprover")}
                      onCheckedChange={(checked) =>
                        setValue("isManagerApprover", !!checked)
                      }
                    />
                    <Label htmlFor="isManagerApprover">
                      Manager is Approver
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approverSequence"
                      checked={watch("approverSequence")}
                      onCheckedChange={(checked) =>
                        setValue("approverSequence", !!checked)
                      }
                    />
                    <Label htmlFor="approverSequence">
                      Sequential Approval
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: User Assignment */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Assignment</span>
              </CardTitle>
              <CardDescription>
                Assign users and managers to this approval rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appliesToUser">Applies To User</Label>
                  <Select
                    value={watch("appliesToUser")}
                    onValueChange={(value) => setValue("appliesToUser", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center space-x-2">
                            <span>{user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select which employee this rule applies to
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select 
                    value={watch("manager")}
                    onValueChange={(value) => setValue("manager", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center space-x-2">
                            <span>{user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select the manager for this employee
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Approvers */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Approvers</span>
                  </CardTitle>
                  <CardDescription>
                    Configure who can approve expenses for this rule
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addApprover}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Approver
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No Approvers Added
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click &quot;Add Approver&quot; to start configuring the
                    approval workflow
                  </p>
                  <Button type="button" onClick={addApprover} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Approver
                  </Button>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {fields.map((field, index) => (
                    <AccordionItem key={field.id} value={`approver-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary">
                            Approver {index + 1}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Click to configure
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`approvers.${index}.user`}>
                                Approver *
                              </Label>
                              <Select
                                value={watch(`approvers.${index}.user`)}
                                onValueChange={(value) =>
                                  setValue(`approvers.${index}.user`, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select approver" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allUsers.map((user) => (
                                    <SelectItem key={user._id} value={user._id}>
                                      <div className="flex items-center space-x-2">
                                        <span>{user.name}</span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {user.role}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {approverSequence && (
                              <div className="space-y-2">
                                <Label
                                  htmlFor={`approvers.${index}.sequenceNo`}
                                >
                                  Sequence Number
                                </Label>
                                <Input
                                  id={`approvers.${index}.sequenceNo`}
                                  type="number"
                                  min="0"
                                  {...register(`approvers.${index}.sequenceNo`)}
                                  placeholder="0"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`approvers.${index}.required`}
                                checked={watch(`approvers.${index}.required`)}
                                onCheckedChange={(checked) =>
                                  setValue(
                                    `approvers.${index}.required`,
                                    !!checked
                                  )
                                }
                              />
                              <Label htmlFor={`approvers.${index}.required`}>
                                Required Approval
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`approvers.${index}.autoApprove`}
                                checked={watch(`approvers.${index}.autoApprove`)}
                                onCheckedChange={(checked) =>
                                  setValue(
                                    `approvers.${index}.autoApprove`,
                                    !!checked
                                  )
                                }
                              />
                              <Label htmlFor={`approvers.${index}.autoApprove`}>
                                Auto Approve
                              </Label>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      !stepValidation[
                        `step${currentStep}` as keyof typeof stepValidation
                      ]
                    }
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !stepValidation.step3}
                    size="lg"
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editMode ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>
                          {editMode
                            ? "Update Approval Rule"
                            : "Create Approval Rule"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Step validation feedback */}
            {!stepValidation[
              `step${currentStep}` as keyof typeof stepValidation
            ] && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  {currentStep === 1 &&
                    "Please fill in the rule name and approval percentage to continue."}
                  {currentStep === 2 &&
                    "Please select both an employee and manager to continue."}
                  {currentStep === 3 &&
                    "Please add at least one approver to continue."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success/Error Message */}
        {submitMessage && (
          <Alert
            className={
              submitMessage.type === "error"
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }
          >
            {submitMessage.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription
              className={
                submitMessage.type === "error"
                  ? "text-red-800"
                  : "text-green-800"
              }
            >
              {submitMessage.text}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
