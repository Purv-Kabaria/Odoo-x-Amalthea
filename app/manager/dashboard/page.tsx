"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Check,
  X,
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { getCurrentUserAction, getCompanyDefaultCurrency, getCompanyInfo } from "@/app/actions/auth";
import Link from "next/link";

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
  managerComment?: string;
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    name: string;
    email: string;
  };
  rejectedAt?: string;
  // New fields for threshold-based approval
  approvals?: Array<{
    approverId: string;
    approvedAt: string;
    comment?: string;
    sequenceNo?: number;
  }>;
  approvalThreshold?: number;
  currentApprovalPercentage?: number;
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
  const [companyCurrency, setCompanyCurrency] = useState<string>('USD');
  const [companyInfo, setCompanyInfo] = useState<{ name: string; defaultCurrency: string; adminId: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchingRef = useRef(false);
  
  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentAction, setCommentAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  // Function to get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CNY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RSD': 'дин',
      'UAH': '₴',
      'TRY': '₺',
      'ILS': '₪',
      'AED': 'د.إ',
      'SAR': 'ر.س',
      'EGP': '£',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh',
      'GHS': '₵',
      'MAD': 'د.م.',
      'TND': 'د.ت',
      'DZD': 'د.ج',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'UYU': '$U',
      'VES': 'Bs.S',
      'BOB': 'Bs',
      'PYG': '₲',
      'GTQ': 'Q',
      'HNL': 'L',
      'NIO': 'C$',
      'CRC': '₡',
      'PAB': 'B/.',
      'DOP': 'RD$',
      'CUP': '$',
      'JMD': 'J$',
      'TTD': 'TT$',
      'BBD': 'Bds$',
      'BSD': 'B$',
      'BZD': 'BZ$',
      'GYD': 'G$',
      'SRD': 'Sr$',
      'THB': '฿',
      'VND': '₫',
      'IDR': 'Rp',
      'MYR': 'RM',
      'PHP': '₱',
      'TWD': 'NT$',
      'NZD': 'NZ$',
      'FJD': 'FJ$',
      'PGK': 'K',
      'SBD': 'SI$',
      'VUV': 'Vt',
      'WST': 'WS$',
      'TOP': 'T$',
      'XPF': '₣',
      'BND': 'B$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'KRW': '₩',
      'RUB': '₽',
      'MXN': '$',
      'BRL': 'R$',
      'AFN': '؋',
      'ETB': 'Br',
      'TMT': 'm',
      'JOD': 'د.ا',
      'XCD': '$',
      'BDT': '৳',
      'NPR': '₨',
      'OMR': 'ر.ع.',
      'IQD': 'ع.د',
      'AMD': '֏',
      'MRU': 'UM'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUserAction();
      if (user) {
        setCurrentUser(user);
        
        // Fetch company's default currency
        const currency = await getCompanyDefaultCurrency(user.organization);
        setCompanyCurrency(currency);
        
        // Fetch full company info
        const company = await getCompanyInfo(user.organization);
        setCompanyInfo(company);
      } else {
        toast.error("Please log in to access this page");
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      toast.error("Authentication error. Please log in again.");
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data);
      } else {
        console.error('Failed to fetch exchange rates:', response.status, response.statusText);
        // Set fallback rates
        setExchangeRates({
          base: 'USD',
          date: new Date().toISOString().split('T')[0],
          rates: {
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'INR': 83.0,
            'JPY': 110.0,
            'CAD': 1.25,
            'AUD': 1.35
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      // Set fallback rates
      setExchangeRates({
        base: 'USD',
        date: new Date().toISOString().split('T')[0],
        rates: {
          'USD': 1,
          'EUR': 0.85,
          'GBP': 0.73,
          'INR': 83.0,
          'JPY': 110.0,
          'CAD': 1.25,
          'AUD': 1.35
        }
      });
    }
  };

  const convertToCompanyCurrency = useCallback(
    (amount: number, fromCurrency: string): number => {
      // Handle cases where fromCurrency might be undefined or invalid
      if (!fromCurrency || typeof fromCurrency !== 'string') {
        return amount;
      }
      
      if (!exchangeRates || !companyCurrency) {
        return amount;
      }

      if (fromCurrency === companyCurrency) {
        return amount;
      }

      const fromRate = exchangeRates.rates[fromCurrency];
      const toRate = exchangeRates.rates[companyCurrency];
      
      if (!fromRate || !toRate) {
        return amount;
      }

      const toUSD = amount / fromRate;
      const toCompanyCurrency = toUSD * toRate;
      const result = Math.round(toCompanyCurrency * 100) / 100;
      
      return result;
    },
    [exchangeRates, companyCurrency]
  );

  const fetchApprovalRequests = useCallback(async (showRefreshLoader = false) => {
    if (fetchingRef.current || !currentUser || !exchangeRates || !companyCurrency) {
      console.log('Skipping fetch - missing required data:', {
        fetching: fetchingRef.current,
        currentUser: !!currentUser,
        exchangeRates: !!exchangeRates,
        companyCurrency
      });
      return;
    }

    fetchingRef.current = true;
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch(
        `/api/manager/approvals?managerId=${currentUser.id}`
      );

      if (response.ok) {
        const data = await response.json();
        
        // Store the raw data first
        setApprovalRequests(data);
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
      setIsRefreshing(false);
      fetchingRef.current = false;
    }
  }, [currentUser, companyCurrency, exchangeRates]);

  const handleRefresh = async () => {
    await fetchApprovalRequests(true);
    toast.success("Data refreshed successfully");
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates && currentUser && companyCurrency) {
      console.log('All data ready, fetching approval requests:', {
        exchangeRates: !!exchangeRates,
        currentUser: !!currentUser,
        companyCurrency
      });
      fetchApprovalRequests();
    }
  }, [exchangeRates, currentUser, companyCurrency, fetchApprovalRequests]);

  // Separate effect to handle currency conversion after data is loaded
  useEffect(() => {
    if (approvalRequests.length > 0 && exchangeRates && companyCurrency) {
      console.log('Converting currencies for loaded data');
      
      const convertedData = approvalRequests.map((request: ApprovalRequest) => {
        const convertedAmount = convertToCompanyCurrency(request.totalAmount, request.currency);
        
        // Only show converted amount if conversion was successful and different from original
        const shouldShowConverted = convertedAmount !== request.totalAmount && convertedAmount > 0;
        
        return {
          ...request,
          convertedAmount: shouldShowConverted ? convertedAmount : undefined,
          convertedCurrency: shouldShowConverted ? companyCurrency : undefined,
        };
      });
      
      // Only update if there are actual changes
      const hasChanges = convertedData.some((item, index) => 
        item.convertedAmount !== approvalRequests[index]?.convertedAmount
      );
      
      if (hasChanges) {
        setApprovalRequests(convertedData);
      }
    }
  }, [approvalRequests, exchangeRates, companyCurrency, convertToCompanyCurrency]);

  // Helper function to check if current manager has already taken action (approved or rejected)
  const hasManagerTakenAction = (request: ApprovalRequest) => {
    if (!currentUser) return false;
    
    // Check if manager has approved
    const hasApproved = request.approvals && request.approvals.some(
      approval => {
        const approverIdStr = approval.approverId.toString();
        const currentUserIdStr = currentUser.id.toString();
        return approverIdStr === currentUserIdStr;
      }
    );
    
    // For now, we'll only check if they've approved
    // TODO: Implement proper rejection tracking in the future
    return hasApproved;
  };

  const handleApprove = async (requestId: string) => {
    if (!currentUser) {
      toast.error("Please log in to approve requests");
      return;
    }

    // Open comment modal for approval
    setSelectedRequestId(requestId);
    setCommentAction('approve');
    setComment('');
    setShowCommentModal(true);
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser) {
      toast.error("Please log in to reject requests");
      return;
    }

    // Open comment modal for rejection
    setSelectedRequestId(requestId);
    setCommentAction('reject');
    setComment('');
    setShowCommentModal(true);
  };

  const handleSubmitComment = async () => {
    if (!currentUser || !selectedRequestId || !commentAction) {
      return;
    }

    try {
      const endpoint = commentAction === 'approve' 
        ? `/api/manager/approvals/${selectedRequestId}/approve-threshold?managerId=${currentUser.id}`
        : `/api/manager/approvals/${selectedRequestId}/reject?managerId=${currentUser.id}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment.trim() }),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        if (commentAction === 'approve') {
          if (responseData.thresholdMet) {
            toast.success(`Request approved successfully! Threshold reached (${responseData.currentApprovalPercentage}%)`);
          } else {
            toast.success(`Approval recorded! ${responseData.approvalsNeeded} more approval(s) needed to reach threshold (${responseData.approvalThreshold}%)`);
          }
        } else {
          toast.success(`Request rejected successfully`);
        }
        
        // Update local state
        setApprovalRequests(prev => 
          prev.map(request => 
            request._id === selectedRequestId 
              ? { 
                  ...request, 
                  requestStatus: commentAction === 'approve' && responseData.thresholdMet ? 'approved' : request.requestStatus,
                  managerComment: comment.trim() || undefined,
                  [commentAction === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date().toISOString(),
                }
              : request
          )
        );
        
        // Close modal
        setShowCommentModal(false);
        setCommentAction(null);
        setSelectedRequestId(null);
        setComment('');
      } else {
        const errorData = await response.json();
        
        if (errorData.sequentialRequired) {
          toast.error(`Sequential approval required. Please wait for ${errorData.waitingFor} to approve first.`);
        } else {
          toast.error(errorData.error || `Failed to ${commentAction} request`);
        }
      }
    } catch (error) {
      console.error(`Error ${commentAction}ing request:`, error);
      toast.error(`Failed to ${commentAction} request`);
    }
  };


  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
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
      (request.description &&
        request.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading || !exchangeRates || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-muted/20 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground font-sans">
              Loading Dashboard
            </h2>
            <p className="text-muted-foreground font-sans">
              Please wait while we prepare your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalRequests = approvalRequests.length;
  const pendingRequests = approvalRequests.filter(
    (r) => r.requestStatus === "pending"
  ).length;
  const approvedRequests = approvalRequests.filter(
    (r) => r.requestStatus === "approved"
  ).length;
  const rejectedRequests = approvalRequests.filter(
    (r) => r.requestStatus === "rejected"
  ).length;

  // Calculate total amount approved
  const totalAmountApproved = approvalRequests
    .filter((r) => r.requestStatus === "approved")
    .reduce((total, request) => {
      // Use converted amount if available, otherwise use original amount
      const amount = request.convertedAmount || request.totalAmount;
      return total + amount;
    }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-card via-card to-muted/20 rounded-xl shadow-lg p-6 border border-border/50">
          {/* Back Button */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-200 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-lg">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground font-sans">
                  Manager Dashboard
                </h1>
                <p className="text-foreground/70 font-sans">
                  Review and manage expense approval requests
                </p>
                {companyInfo && (
                  <div className="mt-2 text-sm text-muted-foreground font-sans">
                    Company: {companyInfo.name} • Default Currency: {companyInfo.defaultCurrency}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar and Actions - Moved to header */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4 z-10" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-background border-primary/30 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20 shadow-sm font-sans rounded-lg"
                />
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="font-sans"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground font-sans">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg border border-primary/20 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary font-sans">
                Total Requests
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {totalRequests}
              </div>
              <p className="text-xs text-primary/70 font-sans">All requests</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 shadow-lg border border-amber-500/20 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 font-sans">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {pendingRequests}
              </div>
              <p className="text-xs text-amber-600/70 font-sans">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg border border-green-500/20 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-600 font-sans">
                Approved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {approvedRequests}
              </div>
              <p className="text-xs text-green-600/70 font-sans">
                Approved requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg border border-destructive/20 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive font-sans">
                Rejected
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {rejectedRequests}
              </div>
              <p className="text-xs text-destructive/70 font-sans">
                Rejected requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 shadow-lg border border-emerald-500/20 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 font-sans">
                Total Approved
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-sans">
                {getCurrencySymbol(companyCurrency)}{totalAmountApproved.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-600/70 font-sans">
                Amount approved in {companyCurrency}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Approvals Table */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border/50 shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 px-6 py-4">
            <h2 className="text-xl font-bold text-foreground font-sans flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Approval Requests</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Approval Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Manager Comment
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground/80 uppercase tracking-wider font-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-muted-foreground bg-gradient-to-br from-muted/20 to-muted/40">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Search className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-foreground/70 font-sans">
                          No approval requests found
                        </p>
                        <p className="text-muted-foreground text-sm font-sans">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr
                      key={request._id}
                      className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200 group">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground font-sans">
                          {request.approvalSubject || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/40 transition-all duration-200">
                            <span className="text-xs font-medium text-primary font-sans">
                              {request.requestOwner.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground font-sans group-hover:text-primary transition-colors duration-200">
                              {request.requestOwner.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-sans">
                              {request.requestOwner.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="text-sm text-muted-foreground max-w-xs truncate font-sans"
                          title={request.description}>
                          {request.description || "No description provided"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={getStatusBadgeColor(
                            request.requestStatus
                          )}>
                          {request.requestStatus.charAt(0).toUpperCase() +
                            request.requestStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {request.approvalThreshold && request.currentApprovalPercentage !== undefined ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-sans">
                                {request.approvals?.length || 0} approvals
                              </span>
                              <span className="text-foreground font-medium font-sans">
                                {request.currentApprovalPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(request.currentApprovalPercentage, 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground font-sans">
                              Threshold: {request.approvalThreshold}%
                            </div>
                            {request.approvals && request.approvals.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-primary font-sans">
                                  Sequential: {request.approvals.length} of {request.approvalThreshold ? Math.ceil(request.approvalThreshold / 100 * 3) : 3} completed
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {request.approvals.map((approval, index) => (
                                    <div key={index} className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                                      <Check className="h-3 w-3" />
                                      <span>Approved</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm font-sans italic">
                            No approval rule
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-foreground font-medium text-sm font-sans">
                              {request.totalAmount} {request.currency}
                            </span>
                          </div>
                          {request.convertedAmount &&
                            request.convertedCurrency && (
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600 font-semibold font-sans">
                                  {getCurrencySymbol(request.convertedCurrency)}{request.convertedAmount.toLocaleString()} {request.convertedCurrency}
                                </span>
                                <span className="text-muted-foreground text-xs font-sans">
                                  (converted to company currency)
                                </span>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          {request.managerComment ? (
                            <div className="space-y-1">
                              <p className="text-sm text-foreground font-sans break-words">
                                {request.managerComment}
                              </p>
                              {request.approvedBy && (
                                <p className="text-xs text-muted-foreground font-sans">
                                  By: {request.approvedBy.name}
                                </p>
                              )}
                              {request.rejectedBy && (
                                <p className="text-xs text-muted-foreground font-sans">
                                  By: {request.rejectedBy.name}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm font-sans italic">
                              No comment
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center space-y-2">
                          {/* Show status if manager has already taken action */}
                          {hasManagerTakenAction(request) ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="text-sm font-medium font-sans">You Approved</span>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApprove(request._id)}
                                disabled={request.requestStatus !== "pending"}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans transition-all duration-200">
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(request._id)}
                                disabled={request.requestStatus !== "pending"}
                                size="sm"
                                variant="destructive"
                                className="bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive text-destructive-foreground border-0 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans transition-all duration-200">
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {/* Show other approvers' status */}
                          {request.approvals && request.approvals.length > 0 && (
                            <div className="text-xs text-muted-foreground font-sans">
                              {request.approvals.length} approval(s) received
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans">
              <MessageSquare className="h-5 w-5" />
              {commentAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground font-sans">
                Add a comment (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Enter your comment for ${commentAction === 'approve' ? 'approving' : 'rejecting'} this request...`}
                className="mt-2 font-sans"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                {comment.length}/500 characters
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCommentModal(false);
                setCommentAction(null);
                setSelectedRequestId(null);
                setComment('');
              }}
              className="font-sans"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitComment}
              className={`font-sans ${
                commentAction === 'approve'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : 'bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive text-destructive-foreground'
              }`}
            >
              {commentAction === 'approve' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve Request
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
