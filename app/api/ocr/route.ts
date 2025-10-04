import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Analyze this receipt or expense document image and extract the following information. Return ONLY a JSON object with these exact fields:
    {
      "amount": "extracted amount as string (e.g., '25.50') - remove currency symbols, keep only numbers and decimal point",
      "currency": "currency code (e.g., 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'SGD', 'HKD', 'CHF', 'NZD', 'MXN', 'BRL', 'ZAR', 'KRW', 'CNY', 'THB', 'MYR', 'PHP', 'IDR', 'VND', 'TWD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'TRY', 'RUB', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'SEK', 'NOK', 'DKK', 'ISK', 'UAH', 'BYN', 'RSD', 'MKD', 'BAM', 'ALL', 'MDL', 'GEL', 'AMD', 'AZN', 'KZT', 'UZS', 'KGS', 'TJS', 'TMT', 'AFN', 'PKR', 'LKR', 'BDT', 'NPR', 'BTN', 'MVR', 'MMK', 'LAK', 'KHR', 'BND', 'FJD', 'PGK', 'SBD', 'VUV', 'WST', 'TOP', 'TVD', 'XPF', 'NIO', 'GTQ', 'HNL', 'SVC', 'BZD', 'JMD', 'TTD', 'BBD', 'BMD', 'KYD', 'AWG', 'ANG', 'SRD', 'GYD', 'XCD', 'DOP', 'HTG', 'CUP', 'BSD', 'BZD', 'BBD', 'BMD', 'KYD', 'AWG', 'ANG', 'SRD', 'GYD', 'XCD', 'DOP', 'HTG', 'CUP', 'BSD')",
      "description": "detailed description of the expense (e.g., 'Business lunch at Restaurant ABC', 'Taxi fare to client meeting', 'Office supplies from Staples')",
      "category": "expense category - map to one of these: 'Food' (for meals, restaurants, groceries), 'Travel' (for transport, flights, hotels), 'Office' (for supplies, equipment), 'Software' (for subscriptions, licenses), 'Training' (for courses, books, education), 'Other' (for anything else)",
      "date": "date in dd/mm/yyyy format (extract from receipt, not current date)",
      "merchant": "merchant/store name (e.g., 'Starbucks', 'Uber', 'Amazon', 'Office Depot')"
    }

    IMPORTANT INSTRUCTIONS:
    - For amount: Extract only the numeric value, remove currency symbols ($, €, £, etc.)
    - For currency: If not clearly visible, infer from context (US receipts = USD, European = EUR, etc.)
    - For description: Be specific and business-relevant, include merchant name if possible
    - For category: Choose the most appropriate category from the list above
    - For date: Extract the actual date from the receipt, not today's date
    - If any information cannot be extracted, use "N/A" as the value
    - Focus on business expense receipts, invoices, and expense documents
    - Be accurate and conservative - if unsure, use "N/A"
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    let extractedData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const requiredFields = [
      "amount",
      "currency",
      "description",
      "category",
      "date",
    ];
    const hasAllFields = requiredFields.every(
      (field) =>
        extractedData.hasOwnProperty(field) && extractedData[field] !== "N/A"
    );

    if (!hasAllFields) {
      console.warn("Some fields could not be extracted:", extractedData);
    }

    // Clean up the amount to ensure it's a valid number string
    let cleanAmount = extractedData.amount || "N/A";
    if (cleanAmount !== "N/A") {
      // Remove any non-numeric characters except decimal point
      cleanAmount = cleanAmount.replace(/[^\d.,]/g, '');
      // Replace comma with decimal point if needed
      cleanAmount = cleanAmount.replace(',', '.');
    }

    return NextResponse.json({
      amount: cleanAmount,
      currency: extractedData.currency || "N/A",
      description: extractedData.description || "N/A",
      category: extractedData.category || "N/A",
      date: extractedData.date || "N/A",
      merchant: extractedData.merchant || "N/A",
    });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
