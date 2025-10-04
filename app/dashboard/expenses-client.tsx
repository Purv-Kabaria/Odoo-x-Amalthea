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
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.convertedAmount || expense.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

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
            <p className="text-lg font-bold text-foreground font-sans">${totalExpenses.toFixed(2)}</p>
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
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans">
            <Plus className="h-4 w-4 mr-1" />
            Add Expense
          </Button>
        </div>
        
        {loading ? (
          <div className="p-4 text-center text-muted-foreground font-sans">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground font-sans">No expenses found</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground capitalize font-sans">{expense.expenseType}</p>
                    <Badge className={getStatusBadgeColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-sans">{expense.description}</p>
                  <p className="text-xs text-muted-foreground font-sans">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground font-sans">
                    {expense.currency.symbol || expense.currency.code} {expense.amount.toFixed(2)}
                  </p>
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
