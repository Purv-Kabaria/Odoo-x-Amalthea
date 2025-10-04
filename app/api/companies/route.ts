import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Company from "@/models/Company";

export async function GET() {
  try {
    await connectToDatabase();
    
    const companies = await Company.find({});
    
    return NextResponse.json({
      success: true,
      count: companies.length,
      companies: companies.map(company => ({
        id: String(company._id),
        name: company.name,
        adminId: company.adminId,
        defaultCurrency: company.defaultCurrency || 'NOT SET',
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectToDatabase();
    
    // Find companies without proper defaultCurrency and update them
    const companiesToUpdate = await Company.find({
      $or: [
        { defaultCurrency: { $exists: false } },
        { defaultCurrency: null },
        { defaultCurrency: '' },
        { defaultCurrency: 'NOT SET' }
      ]
    });
    
    console.log(`Found ${companiesToUpdate.length} companies to update`);
    
    for (const company of companiesToUpdate) {
      await Company.findByIdAndUpdate(company._id, { 
        defaultCurrency: 'USD' 
      });
      console.log(`Updated ${company.name} with defaultCurrency: USD`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${companiesToUpdate.length} companies with default currency`,
      updated: companiesToUpdate.length
    });
  } catch (error) {
    console.error("Error updating companies:", error);
    return NextResponse.json(
      { error: "Failed to update companies" },
      { status: 500 }
    );
  }
}
