"use client";
import { useState, useEffect } from "react";
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

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data.filter((expense: any) => expense.userId._id === userId));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
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

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
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
      </div>
    </div>
  );
}
