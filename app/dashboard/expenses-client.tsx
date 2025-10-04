"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, DollarSign, TrendingUp } from "lucide-react";

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
}

interface ExpensesClientProps {
  userId: string;
}

export function ExpensesClient({ userId }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(
        data.filter(
          (expense: Expense & { userId: { _id: string } }) =>
            expense.userId._id === userId
        )
      );
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-lg font-bold text-gray-900">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Reports</p>
            <p className="text-lg font-bold text-gray-900">{expenses.length}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-lg font-bold text-gray-900">{pendingExpenses}</p>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Recent Expenses</h4>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No expenses found</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 capitalize">
                      {expense.expenseType}
                    </p>
                    <Badge className={getStatusBadgeColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {expense.currency.symbol || expense.currency.code}{" "}
                    {expense.amount.toFixed(2)}
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
