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

// Common currencies as fallback
const fallbackCurrencies: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
  { code: 'AMD', name: 'Armenian dram', symbol: '֏' }
];

// In-memory cache
let currencyCache: CurrencyOption[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function fetchCurrencies(): Promise<CurrencyOption[]> {
  // Return cached data if available and not expired
  const now = Date.now();
  if (currencyCache && now - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached currency data");
    return currencyCache;
  }
  
  try {
    // Use AbortController to set a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies', {
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.status}`);
    }
    
    const countries: Country[] = await response.json();
    const currencyMap = new Map<string, CurrencyOption>();
    
    // Extract all unique currencies from all countries
    countries.forEach(country => {
      if (country.currencies) {
        Object.entries(country.currencies).forEach(([code, details]) => {
          if (!currencyMap.has(code)) {
            currencyMap.set(code, {
              code,
              name: details.name,
              symbol: details.symbol
            });
          }
        });
      }
    });
    
    // Convert the map to an array and sort by currency code
    const result = Array.from(currencyMap.values()).sort((a, b) => 
      a.code.localeCompare(b.code)
    );
    
    // Update the cache
    currencyCache = result;
    lastFetchTime = now;
    
    return result;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    
    // If we have cached data but it's expired, still use it as a fallback
    if (currencyCache) {
      console.log("Using expired cache as fallback");
      return currencyCache;
    }
    
    // Return common fallback currencies if API fails and no cache exists
    console.log("Using hardcoded fallback currencies");
    currencyCache = fallbackCurrencies;
    lastFetchTime = now;
    return fallbackCurrencies;
  }
}

// Update the function to handle both string codes and currency objects
export function isValidCurrencyCode(currency: string | CurrencyOption): boolean {
  // Handle if we get passed a currency object instead of just the code
  const code = typeof currency === 'object' && currency !== null && 'code' in currency 
    ? currency.code 
    : currency;
    
  // Log a warning if we received something unexpected
  if (typeof code !== 'string') {
    console.warn(`isValidCurrencyCode received non-string: ${JSON.stringify(currency)}`);
    return false;
  }
  
  // First check against our fallback currencies (this is always fast)
  if (fallbackCurrencies.some(c => c.code === code)) {
    return true;
  }
  
  // If we have a cached list, check against that too
  if (currencyCache) {
    return currencyCache.some(c => c.code === code);
  }
  
  // Without a cache, we'll have to consider it potentially valid
  // since we can't perform a full validation without an API call
  return true;
}
