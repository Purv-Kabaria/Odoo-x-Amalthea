"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  convertedAmount?: number;
  convertedCurrency?: string;
}

interface ExchangeRates {
  rates: Record<string, number>;
  base: string;
  date: string;
}

interface ExpensesClientProps {
  userId: string;
}

export function ExpensesClient({ userId }: ExpensesClientProps) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
    }
  }, []);

  const convertToINR = useCallback((amount: number, fromCurrency: string): number => {
    if (!exchangeRates || fromCurrency === "INR") {
      return amount;
    }

    const toUSD = amount / exchangeRates.rates[fromCurrency];
    const toINR = toUSD * exchangeRates.rates["INR"];

    return Math.round(toINR * 100) / 100;
  }, [exchangeRates]);

  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  useEffect(() => {
    if (exchangeRates) {
      fetchExpenses();
    }
  }, [userId, exchangeRates]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the API response structure (check if it has success and data properties)
      const expensesData = result.success ? result.data : result;
      
      // Filter expenses for the current user
      const userExpenses = expensesData.filter((expense: Expense) => 
        expense.userId && expense.userId._id === userId
      );

      // Add currency conversion if exchange rates are available
      const expensesWithConversion = userExpenses.map((expense: Expense) => ({
        ...expense,
        convertedAmount: convertToINR(expense.amount, expense.currency.code),
        convertedCurrency: "INR",
      }));
      
      setExpenses(expensesWithConversion);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseClick = () => {
    router.push('/expenseSubmission');
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.convertedAmount || expense.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

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
            <p className="text-lg font-bold text-gray-900">₹{totalExpenses.toFixed(2)} INR</p>
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
          <Button 
            onClick={handleAddExpenseClick}
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
        
        {loading || !exchangeRates ? (
          <div className="p-4 text-center text-gray-500">
            {loading ? "Loading expenses..." : "Loading exchange rates..."}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            Error: {error}
            <Button 
              onClick={fetchExpenses} 
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              Retry
            </Button>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No expenses found</p>
            <Button 
              onClick={handleAddExpenseClick}
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Submit your first expense
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 capitalize">{expense.expenseType}</p>
                    <Badge className={getStatusBadgeColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                  <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-semibold">
                        {expense.currency.symbol || expense.currency.code} {expense.amount.toFixed(2)}
                      </span>
                    </div>
                    {expense.convertedAmount && expense.convertedCurrency && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold text-lg">
                          ₹{expense.convertedAmount.toFixed(2)} INR
                        </span>
                        <span className="text-gray-400 text-sm">
                          (converted)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {expenses.length > 5 && (
          <div className="text-center pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/expenses')} // You can create an expenses list page later
            >
              View All Expenses ({expenses.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}