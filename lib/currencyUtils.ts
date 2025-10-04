interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [code: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol?: string;
}

const fallbackCurrencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
  { code: "BZD", name: "Belize Dollar", symbol: "BZ$" },
  { code: "AMD", name: "Armenian dram", symbol: "֏" },
];

let currencyCache: CurrencyOption[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function fetchCurrencies(): Promise<CurrencyOption[]> {
  const now = Date.now();
  if (currencyCache && now - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached currency data");
    return currencyCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,currencies",
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status}`);
    }

    const countries: Country[] = await response.json();
    const currencyMap = new Map<string, CurrencyOption>();

    countries.forEach((country) => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, details]) => {
          if (!currencyMap.has(code) && code && details.name) {
            currencyMap.set(code, {
              code,
              name: details.name,
              symbol: details.symbol,
            });
          }
        });
      }
    });

    const result = Array.from(currencyMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    currencyCache = result.length > 0 ? result : fallbackCurrencies;
    lastFetchTime = now;

    return currencyCache;
  } catch (error) {
    console.error("Error fetching currencies:", error);

    if (currencyCache) {
      console.log("Using expired cache as fallback");
      return currencyCache;
    }

    console.log("Using hardcoded fallback currencies");
    currencyCache = fallbackCurrencies;
    lastFetchTime = now;
    return fallbackCurrencies;
  }
}

export function isValidCurrencyCode(
  currency: string | CurrencyOption
): boolean {
  try {
    const code =
      typeof currency === "object" && currency !== null && "code" in currency
        ? currency.code
        : currency;

    if (typeof code !== "string" || !code.trim()) {
      console.warn(
        `isValidCurrencyCode received invalid input: ${JSON.stringify(
          currency
        )}`
      );
      return false;
    }

    const upperCode = code.trim().toUpperCase();

    if (fallbackCurrencies.some((c) => c.code === upperCode)) {
      return true;
    }

    if (currencyCache) {
      return currencyCache.some((c) => c.code === upperCode);
    }

    const currencyCodeRegex = /^[A-Z]{3}$/;
    if (!currencyCodeRegex.test(upperCode)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in isValidCurrencyCode:", error);
    return false;
  }
}
