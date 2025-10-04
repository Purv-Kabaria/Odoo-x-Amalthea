"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUserAction } from "@/app/actions/auth";

interface ApprovalRequest {
  _id: string;
  approvalSubject: string;
  requestOwner: {
    name: string;
    email: string;
    organization?: string;
  };
  category: string;
  requestStatus: "pending" | "approved" | "rejected";
  totalAmount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  description?: string;
  createdAt: string;
}

interface ExchangeRates {
  rates: Record<string, number>;
  base: string;
  date: string;
}

export default function ManagerDashboard() {
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
    email: string;
    organization: string;
  } | null>(null);
  const fetchingRef = useRef(false);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUserAction();
      if (user) {
        setCurrentUser(user);
        console.log("Current user:", user);
      } else {
        toast.error("Please log in to access this page");
        // Redirect to login or handle authentication
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      toast.error("Authentication error. Please log in again.");
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  };

  const convertToINR = useCallback(
    (amount: number, fromCurrency: string): number => {
      if (!exchangeRates || fromCurrency === "INR") {
        return amount;
      }

      const toUSD = amount / exchangeRates.rates[fromCurrency];
      const toINR = toUSD * exchangeRates.rates["INR"];

      return Math.round(toINR * 100) / 100;
    },
    [exchangeRates]
  );

  const fetchApprovalRequests = useCallback(async () => {
    if (fetchingRef.current || !currentUser) return; // Prevent multiple simultaneous requests and ensure user is loaded

    fetchingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/manager/approvals?managerId=${currentUser.id}`
      );

      if (response.ok) {
        const data = await response.json();

        const convertedData = data.map((request: ApprovalRequest) => ({
          ...request,
          convertedAmount: convertToINR(request.totalAmount, request.currency),
          convertedCurrency: "INR",
        }));
        setApprovalRequests(convertedData);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.details ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`;
        toast.error("Failed to load approval requests: " + errorMessage);
      }
    } catch (error) {
      console.error("Failed to fetch approval requests:", error);
      toast.error("Failed to load approval requests");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [convertToINR, currentUser]);

  useEffect(() => {
    fetchCurrentUser();
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates && currentUser) {
      fetchApprovalRequests();
    }
  }, [exchangeRates, currentUser, fetchApprovalRequests]);

  const handleApprove = async (requestId: string) => {
    if (!currentUser) {
      toast.error("Please log in to approve requests");
      return;
    }

    try {
      const response = await fetch(
        `/api/manager/approvals/${requestId}/approve?managerId=${currentUser.id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Request approved successfully");
        fetchApprovalRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser) {
      toast.error("Please log in to reject requests");
      return;
    }

    try {
      const response = await fetch(
        `/api/manager/approvals/${requestId}/reject?managerId=${currentUser.id}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Request rejected successfully");
        fetchApprovalRequests();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredRequests = approvalRequests.filter(
    (request) =>
      request.approvalSubject
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requestOwner.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.description && request.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()))
  );

  if (loading || !exchangeRates || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="h-12 bg-slate-200 rounded w-full mb-6"></div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          {!exchangeRates && (
            <div className="text-center py-8">
              <div className="text-slate-500">Loading exchange rates...</div>
            </div>
          )}
          {!currentUser && (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading user information...</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-800 mb-2">
                Approval Dashboard
              </h1>
              <p className="text-slate-600 text-sm">
                Review and manage expense approval requests
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Live</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by subject, owner, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Approvals Table */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <Search className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-slate-500">No approval requests found</p>
                          <p className="text-slate-400 text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {request.approvalSubject || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {request.requestOwner.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {request.requestOwner.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {request.requestOwner.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 max-w-xs truncate" title={request.description}>
                            {request.description || "No description provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={getStatusBadgeColor(
                              request.requestStatus
                            )}
                          >
                            {request.requestStatus.charAt(0).toUpperCase() +
                              request.requestStatus.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-600 font-medium text-sm">
                                {request.totalAmount} {request.currency}
                              </span>
                            </div>
                            {request.convertedAmount &&
                              request.convertedCurrency && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-green-600 font-semibold">
                                    ₹{request.convertedAmount} INR
                                  </span>
                                  <span className="text-slate-400 text-xs">
                                    (converted)
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 justify-center">
                            <Button
                              onClick={() => handleApprove(request._id)}
                              disabled={request.requestStatus !== "pending"}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request._id)}
                              disabled={request.requestStatus !== "pending"}
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Branding */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WS</span>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Whole Starling</div>
              <div className="text-xs text-slate-500">Expense Management System</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Powered by Next.js & MongoDB
          </div>
        </div>
      </div>
    </div>
  );
}
