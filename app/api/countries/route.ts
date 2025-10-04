import { NextResponse } from "next/server";

interface CountryData {
  name: {
    common: string;
    official: string;
  };
  currencies?: Record<string, unknown>;
}

interface FormattedCountry {
  name: string;
  official: string;
  currencies: string[];
}

export async function GET() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies");

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const countries: CountryData[] = await response.json();

    const formattedCountries: FormattedCountry[] = countries
      .map((country: CountryData) => ({
        name: country.name.common,
        official: country.name.official,
        currencies: country.currencies ? Object.keys(country.currencies) : [],
      }))
      .sort((a: FormattedCountry, b: FormattedCountry) =>
        a.name.localeCompare(b.name)
      );

    return NextResponse.json(formattedCountries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
