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
    Analyze this image and extract the following expense information. Return ONLY a JSON object with these exact fields:
    {
      "amount": "extracted amount as string (e.g., '25.50') with currency symbol",
      "paid_by": "person or entity who paid",
      "description": "description of the expense (if not provided, but expense is mentioned, use the expense name as description)",
      "category": "expense category (e.g., 'Food', 'Transport', 'Office', 'Travel', etc.)",
      "date": "date in dd/mm/yyyy format"
    }

    If any information cannot be extracted, use "N/A" as the value.
    Focus on receipts, invoices, or expense documents.
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
      "paid_by",
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

    return NextResponse.json({
      amount: extractedData.amount || "N/A",
      paid_by: extractedData.paid_by || "N/A",
      description: extractedData.description || "N/A",
      category: extractedData.category || "N/A",
      date: extractedData.date || "N/A",
    });
  } catch (error) {
    console.error("OCR API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
