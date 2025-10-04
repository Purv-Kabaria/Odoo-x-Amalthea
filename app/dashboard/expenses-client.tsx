"use client";
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, TrendingUp } from "lucide-react";

interface Expense {
  _id: string;
  expenseType: string;
  amount: number;
  currency: {
    code: string;
    name: string;
    symbol?: string;
  };
  date: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
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
}

interface ExpensesClientProps {
  userId: string;
}

export function ExpensesClient({ userId }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch("/api/expenses");
      const result = await response.json();
      
      // Handle the API response structure
      const expenses = result.data || result;
      
      // Ensure we have an array before filtering
      if (Array.isArray(expenses)) {
        setExpenses(
          expenses.filter(
            (expense: Expense & { userId: { _id: string } }) =>
              expense.userId && expense.userId._id === userId
          )
        );
      } else {
        console.error("Invalid expenses data format:", expenses);
        setExpenses([]);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const pendingExpenses = expenses.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Expense Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground font-sans">Total Expenses</p>
            <p className="text-lg font-bold text-foreground font-sans">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground font-sans">Total Reports</p>
            <p className="text-lg font-bold text-foreground font-sans">{expenses.length}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground font-sans">Pending</p>
            <p className="text-lg font-bold text-foreground font-sans">{pendingExpenses}</p>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground font-sans">Recent Expenses</h4>
        </div>

        {loading ? (
          <div className="p-4 text-center text-muted-foreground font-sans">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground font-sans">No expenses found</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense._id}
                className="flex items-start justify-between p-4 bg-muted rounded-lg border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-medium text-foreground capitalize font-sans">
                      {expense.expenseType}
                    </p>
                    <Badge className={getStatusBadgeColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-2">
                    {expense.description}
                  </p>
                  {expense.managerComment && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary/30 rounded-r-md shadow-sm">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary/60 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wide font-sans">
                              Manager Feedback
                            </p>
                            <div className="h-px bg-primary/20 flex-1"></div>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed font-sans mb-2">
                            {expense.managerComment}
                          </p>
                          {(expense.approvedBy || expense.rejectedBy) && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                              <p className="text-xs text-muted-foreground font-sans">
                                {expense.status === 'approved' ? 'Approved' : 'Rejected'} by {expense.approvedBy?.name || expense.rejectedBy?.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                    <p className="text-xs text-muted-foreground font-sans">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-bold text-foreground font-sans text-lg">
                    {expense.currency.symbol || expense.currency.code}{" "}
                    {expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans mt-1">
                    {expense.currency.code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
