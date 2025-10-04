"use client"

import React, { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCurrencies, CurrencyOption } from "@/lib/currencyUtils"

// Improved form schema with better validation
const formSchema = z.object({
  expenseType: z.string().min(1, "Please select an expense type."),
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a valid positive number"),
  currency: z.string().min(1, "Please select a currency."),
  date: z.date().refine(val => {
    if (!val) return false;
    const today = new Date();
    return val <= today;
  }, {
    message: "Date cannot be in the future."
  }),
  description: z.string()
    .min(5, "Description must be at least 5 characters.")
    .max(500, "Description must not exceed 500 characters."),
});

const SubmitExpense = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
    },
  })

  // Fetch currencies when component mounts
  useEffect(() => {
    const getCurrencies = async () => {
      setIsLoadingCurrencies(true)
      try {
        const currencyOptions = await fetchCurrencies()
        setCurrencies(currencyOptions)
      } catch (error) {
        console.error("Failed to fetch currencies:", error)
      } finally {
        setIsLoadingCurrencies(false)
      }
    }

    getCurrencies()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Validate amount again
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid positive amount.");
      }
      
      // Find the selected currency object from our currencies array
      const selectedCurrency = currencies.find(c => c.code === values.currency);
      
      if (!selectedCurrency) {
        throw new Error("Selected currency not found. Please refresh and try again.");
      }
      
      // Validate description
      const description = values.description.trim();
      if (description.length < 5) {
        throw new Error("Description must be at least 5 characters long.");
      }
      
      // Format the data for submission with the full currency object
      const expenseData = {
        expenseType: values.expenseType,
        amount: amount,
        currency: selectedCurrency, // Send the full currency object
        date: values.date.toISOString(),
        description: description
      };

      console.log("Submitting expense data:", expenseData);

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.log(parseError)
        console.error("Failed to parse response as JSON");
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        console.error("Server error response:", data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      console.log("Expense created:", data);
      setSubmitSuccess(true);
      form.reset({
        description: "",
        amount: "",
        date: new Date(),
        expenseType: "",
        currency: ""
      });
      
      // Show success message briefly, then redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Redirect after 2 seconds
      
    } catch (error: unknown) {
      console.error("Failed to submit expense:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit expense. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Submit Expense</CardTitle>
          <CardDescription>
            Fill out this form to submit an expense for reimbursement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Expense submitted successfully! Redirecting to dashboard...
              </p>
            </div>
          )}
          
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{submitError}</p>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expense type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="meal">Meals & Entertainment</SelectItem>
                          <SelectItem value="supplies">Office Supplies</SelectItem>
                          <SelectItem value="software">Software/Subscriptions</SelectItem>
                          <SelectItem value="training">Training/Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the category that best describes your expense.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Expense</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The date when the expense occurred.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the total amount spent.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCurrencies ? "Loading currencies..." : "Select currency"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCurrencies ? (
                            <SelectItem value="loading" disabled>Loading currencies...</SelectItem>
                          ) : (
                            currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name} {currency.symbol ? `(${currency.symbol})` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the currency of your expense.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about this expense..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the purpose of this expense (e.g., &ldquo;Client lunch meeting with ABC Corp&rdquo;).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                  disabled={isSubmitting}
                >
                  Back to Dashboard
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoadingCurrencies}>
                  {isSubmitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitExpense