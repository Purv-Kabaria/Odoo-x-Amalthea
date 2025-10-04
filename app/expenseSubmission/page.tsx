"use client"

import React, { useState, useEffect, useRef } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { CalendarIcon, Upload, ArrowLeft, Receipt, Sparkles, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { getCurrentUserAction, getCompanyDefaultCurrency, getCompanyInfo } from "@/app/actions/auth"

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
import { CardContent, CardDescription } from "@/components/ui/card"
import { fetchCurrencies, CurrencyOption } from "@/lib/currencyUtils"
import Image from "next/image"

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
  const ocrFileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<{ name: string; defaultCurrency: string; adminId: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
    },
  })

  useEffect(() => {
    const getCurrencies = async () => {
      setIsLoadingCurrencies(true)
      try {
        const currencyOptions = await fetchCurrencies()
        setCurrencies(currencyOptions)
        
        // Get company's default currency
        try {
          const user = await getCurrentUserAction()
          if (user) {
            const defaultCurrency = await getCompanyDefaultCurrency(user.organization)
            // Set the form default to company currency
            form.setValue('currency', defaultCurrency)
            
            // Get full company info
            const company = await getCompanyInfo(user.organization)
            setCompanyInfo(company)
            console.log("Company info:", company)
          }
        } catch (error) {
          console.error("Failed to get company currency:", error)
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error)
      } finally {
        setIsLoadingCurrencies(false)
      }
    }

    getCurrencies()
  }, [form])

  // Handle OCR image upload
  const handleOcrImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error("Please select image files only")
      return
    }
    
    if (imageFiles.length > 1) {
      toast.error("Please select only one image for OCR processing")
      return
    }
    
    setOcrImage(imageFiles[0])
    toast.success("Image ready for OCR processing")
  }


  // OCR processing
  const processOCR = async () => {
    if (!ocrImage) {
      toast.error("Please upload an image for OCR processing first")
      return
    }

    setIsProcessingOCR(true)
    try {
      const formData = new FormData()
      formData.append('image', ocrImage)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'OCR processing failed')
      }

      // Fill form with OCR data
      console.log('OCR Response:', data)
      
      if (data.amount && data.amount !== "N/A") {
        form.setValue('amount', data.amount)
        console.log('Set amount:', data.amount)
      }
      if (data.currency && data.currency !== "N/A") {
        // Check if the currency exists in our currencies list
        const currencyExists = currencies.some(c => c.code === data.currency)
        if (currencyExists) {
          form.setValue('currency', data.currency)
          console.log('Set currency:', data.currency)
        } else {
          console.log('Currency not found in list:', data.currency, 'Available:', currencies.map(c => c.code))
          // Try to find a similar currency or default to USD
          const similarCurrency = currencies.find(c => 
            c.code.toLowerCase().includes(data.currency.toLowerCase()) ||
            c.name.toLowerCase().includes(data.currency.toLowerCase())
          )
          if (similarCurrency) {
            form.setValue('currency', similarCurrency.code)
            console.log('Set similar currency:', similarCurrency.code)
          }
        }
      }
      if (data.description && data.description !== "N/A") {
        form.setValue('description', data.description)
        console.log('Set description:', data.description)
      }
      if (data.category && data.category !== "N/A") {
        // Map category to expense type
        const categoryMap: { [key: string]: string } = {
          'Food': 'meal',
          'Travel': 'travel',
          'Transport': 'travel',
          'Office': 'supplies',
          'Software': 'software',
          'Training': 'training',
          'Other': 'other',
        }
        const expenseType = categoryMap[data.category] || 'other'
        form.setValue('expenseType', expenseType)
        console.log('Set expenseType:', expenseType, 'from category:', data.category)
      }
      if (data.date && data.date !== "N/A") {
        try {
          const [day, month, year] = data.date.split('/')
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          if (!isNaN(parsedDate.getTime())) {
            form.setValue('date', parsedDate)
            console.log('Set date:', parsedDate)
          }
        } catch (error) {
          console.error('Error parsing date:', error)
        }
      }
      
      // Trigger form validation and re-render
      form.trigger()
      
      // Small delay to ensure form updates are visible
      setTimeout(() => {
        toast.success("OCR processing completed! Please review the filled details.")
      }, 100)
    } catch (error) {
      console.error('OCR Error:', error)
      toast.error("OCR processing failed. Please try again.")
    } finally {
      setIsProcessingOCR(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid positive amount.");
      }
      
      const selectedCurrency = currencies.find(c => c.code === values.currency);
      
      if (!selectedCurrency) {
        throw new Error("Selected currency not found. Please refresh and try again.");
      }
      
      const description = values.description.trim();
      if (description.length < 5) {
        throw new Error("Description must be at least 5 characters long.");
      }
      

      // Format the data for submission with the full currency object
      const expenseData = {
        expenseType: values.expenseType,
        amount: amount,
        currency: selectedCurrency,
        date: values.date.toISOString(),
        description: description,
      };
      
      console.log("Full expense data being sent:", expenseData);

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
        currency: "",
      });
      setOcrImage(null);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: unknown) {
      console.error("Failed to submit expense:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit expense. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-sans mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground font-sans mb-2">
              Submit Expense
            </h1>
            <div className="text-muted-foreground font-sans text-lg">
              <p>Fill out this form to submit an expense for reimbursement</p>
              {companyInfo && (
                <div className="mt-2 text-sm text-muted-foreground font-sans">
                  Company: {companyInfo.name} • Default Currency: {companyInfo.defaultCurrency}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card shadow-xl border border-border rounded-lg">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 rounded-lg p-6">
            <div className="text-2xl font-bold text-foreground flex items-center space-x-2 font-sans">
              <Receipt className="h-6 w-6 text-primary" />
              <span>Expense Details</span>
            </div>
            <CardDescription className="text-muted-foreground font-sans">
              Complete all required fields to submit your expense
            </CardDescription>
          </div>
          <CardContent className="p-8">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-600 font-sans">
                  Expense submitted successfully! Redirecting to dashboard...
                </p>
              </div>
            )}
            
            {submitError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-sans">{submitError}</p>
              </div>
            )}

            {/* OCR Section */}
            <div className="mb-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold text-foreground font-sans mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Smart Receipt Processing
              </h3>
              <p className="text-muted-foreground font-sans mb-4">
                Upload a receipt image and let AI automatically extract the expense details for you. This image will not be attached to the expense.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    ref={ocrFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOcrImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => ocrFileInputRef.current?.click()}
                    className="font-sans"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Receipt for OCR
                  </Button>
                  
                  {ocrImage && (
                    <Button
                      type="button"
                      onClick={processOCR}
                      disabled={isProcessingOCR}
                      className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary font-sans"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isProcessingOCR ? "Processing..." : "Extract Details with AI"}
                    </Button>
                  )}
                </div>
                
                {ocrImage && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground font-sans mb-2">OCR Image Preview:</p>
                    <div className="relative inline-block">
                      <Image
                        src={URL.createObjectURL(ocrImage)}
                        alt="OCR Image"
                        width={128}
                        height={96}
                        className="w-32 h-24 object-contain rounded-lg border border-border bg-muted/20"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setOcrImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expenseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-sans font-medium">Expense Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary/20 font-sans">
                            <SelectValue placeholder="Select expense type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="travel" className="font-sans">Travel</SelectItem>
                          <SelectItem value="meal" className="font-sans">Meals & Entertainment</SelectItem>
                          <SelectItem value="supplies" className="font-sans">Office Supplies</SelectItem>
                          <SelectItem value="software" className="font-sans">Software/Subscriptions</SelectItem>
                          <SelectItem value="training" className="font-sans">Training/Education</SelectItem>
                          <SelectItem value="other" className="font-sans">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-muted-foreground font-sans">
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
                      <FormLabel className="text-foreground font-sans font-medium">Date of Expense</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-background border-border hover:bg-muted font-sans",
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
                        <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
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
                      <FormDescription className="text-muted-foreground font-sans">
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
                      <FormLabel className="text-foreground font-sans font-medium">Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          className="bg-background border-border focus:border-primary focus:ring-primary/20 font-sans"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground font-sans">
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
                      <FormLabel className="text-foreground font-sans font-medium">Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-primary/20 font-sans">
                            <SelectValue placeholder={isLoadingCurrencies ? "Loading currencies..." : "Select currency"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-border">
                          {isLoadingCurrencies ? (
                            <SelectItem value="loading" disabled className="font-sans">Loading currencies...</SelectItem>
                          ) : (
                            currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code} className="font-sans">
                                {currency.code} - {currency.name} {currency.symbol ? `(${currency.symbol})` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-muted-foreground font-sans">
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
                    <FormLabel className="text-foreground font-sans font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about this expense..."
                        className="min-h-[100px] bg-background border-border focus:border-primary focus:ring-primary/20 font-sans"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground font-sans">
                      Explain the purpose of this expense (e.g., &ldquo;Client lunch meeting with ABC Corp&rdquo;).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    router.push('/dashboard');
                  }}
                  disabled={isSubmitting}
                  className="font-sans"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingCurrencies}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
                >
                  {isSubmitting ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
      </div>
    </div>
  )
}

export default SubmitExpense