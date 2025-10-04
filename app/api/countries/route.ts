import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");
    
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }
    
    const countries = await response.json();
    
    // Transform the data to a simpler format for the dropdown
    const formattedCountries = countries
      .map((country: any) => ({
        name: country.name.common,
        official: country.name.official,
        currencies: country.currencies ? Object.keys(country.currencies) : []
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    
    return NextResponse.json(formattedCountries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
