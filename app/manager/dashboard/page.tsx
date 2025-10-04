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
      request.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !exchangeRates || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-12 bg-gray-700 rounded w-full mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          {!exchangeRates && (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading exchange rates...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "cursive" }}
          >
            Approvals to review
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Approvals Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white border-b border-gray-600">
                      Approval Subject
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white border-b border-gray-600">
                      Request Owner
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white border-b border-gray-600">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white border-b border-gray-600">
                      Request Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white border-b border-gray-600">
                      Amount (Original & INR)
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-white border-b border-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No approval requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={request._id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 text-white">
                          {request.approvalSubject || "none"}
                        </td>
                        <td className="px-6 py-4 text-white">
                          {request.requestOwner.name}
                        </td>
                        <td className="px-6 py-4 text-white">
                          {request.category}
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
                        <td className="px-6 py-4 text-white">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-red-400 font-semibold">
                                {request.totalAmount} {request.currency}
                              </span>
                            </div>
                            {request.convertedAmount &&
                              request.convertedCurrency && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-green-400 font-bold text-lg">
                                    ₹{request.convertedAmount} INR
                                  </span>
                                  <span className="text-gray-400 text-sm">
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
                              className="bg-green-600 hover:bg-green-700 text-white border border-green-500 px-4 py-2 rounded"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request._id)}
                              disabled={request.requestStatus !== "pending"}
                              className="bg-red-600 hover:bg-red-700 text-white border border-red-500 px-4 py-2 rounded"
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
        <div className="mt-8 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-orange-500"></div>
            <div className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium">
              Whole Starling
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
