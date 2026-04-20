import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

// Full world-standard currency list (same as major fintech apps)
export const CURRENCIES = [
  // ── Asia ──
  { code: "INR",  symbol: "₹",  label: "Indian Rupee",       region: "Asia" },
  { code: "CNY",  symbol: "¥",  label: "Chinese Yuan",        region: "Asia" },
  { code: "JPY",  symbol: "¥",  label: "Japanese Yen",        region: "Asia" },
  { code: "KRW",  symbol: "₩",  label: "South Korean Won",    region: "Asia" },
  { code: "SGD",  symbol: "S$", label: "Singapore Dollar",    region: "Asia" },
  { code: "HKD",  symbol: "HK$",label: "Hong Kong Dollar",    region: "Asia" },
  { code: "THB",  symbol: "฿",  label: "Thai Baht",           region: "Asia" },
  { code: "IDR",  symbol: "Rp", label: "Indonesian Rupiah",   region: "Asia" },
  { code: "MYR",  symbol: "RM", label: "Malaysian Ringgit",   region: "Asia" },
  { code: "PHP",  symbol: "₱",  label: "Philippine Peso",     region: "Asia" },
  { code: "VND",  symbol: "₫",  label: "Vietnamese Dong",     region: "Asia" },
  { code: "PKR",  symbol: "₨",  label: "Pakistani Rupee",     region: "Asia" },
  { code: "BDT",  symbol: "৳",  label: "Bangladeshi Taka",    region: "Asia" },
  { code: "LKR",  symbol: "₨",  label: "Sri Lankan Rupee",    region: "Asia" },
  { code: "NPR",  symbol: "₨",  label: "Nepalese Rupee",      region: "Asia" },
  { code: "AED",  symbol: "د.إ",label: "UAE Dirham",          region: "Asia" },
  { code: "SAR",  symbol: "﷼",  label: "Saudi Riyal",         region: "Asia" },
  { code: "QAR",  symbol: "﷼",  label: "Qatari Riyal",        region: "Asia" },
  { code: "KWD",  symbol: "د.ك",label: "Kuwaiti Dinar",       region: "Asia" },
  { code: "ILS",  symbol: "₪",  label: "Israeli Shekel",      region: "Asia" },
  { code: "TRY",  symbol: "₺",  label: "Turkish Lira",        region: "Asia" },
  // ── Americas ──
  { code: "USD",  symbol: "$",  label: "US Dollar",           region: "Americas" },
  { code: "CAD",  symbol: "CA$",label: "Canadian Dollar",     region: "Americas" },
  { code: "MXN",  symbol: "Mex$",label:"Mexican Peso",        region: "Americas" },
  { code: "BRL",  symbol: "R$", label: "Brazilian Real",      region: "Americas" },
  { code: "ARS",  symbol: "$",  label: "Argentine Peso",      region: "Americas" },
  { code: "CLP",  symbol: "$",  label: "Chilean Peso",        region: "Americas" },
  { code: "COP",  symbol: "$",  label: "Colombian Peso",      region: "Americas" },
  { code: "PEN",  symbol: "S/", label: "Peruvian Sol",        region: "Americas" },
  // ── Europe ──
  { code: "EUR",  symbol: "€",  label: "Euro",                region: "Europe" },
  { code: "GBP",  symbol: "£",  label: "British Pound",       region: "Europe" },
  { code: "CHF",  symbol: "Fr", label: "Swiss Franc",         region: "Europe" },
  { code: "SEK",  symbol: "kr", label: "Swedish Krona",       region: "Europe" },
  { code: "NOK",  symbol: "kr", label: "Norwegian Krone",     region: "Europe" },
  { code: "DKK",  symbol: "kr", label: "Danish Krone",        region: "Europe" },
  { code: "PLN",  symbol: "zł", label: "Polish Zloty",        region: "Europe" },
  { code: "CZK",  symbol: "Kč", label: "Czech Koruna",        region: "Europe" },
  { code: "HUF",  symbol: "Ft", label: "Hungarian Forint",    region: "Europe" },
  { code: "RON",  symbol: "lei",label: "Romanian Leu",        region: "Europe" },
  { code: "RUB",  symbol: "₽",  label: "Russian Ruble",       region: "Europe" },
  { code: "UAH",  symbol: "₴",  label: "Ukrainian Hryvnia",   region: "Europe" },
  // ── Africa ──
  { code: "ZAR",  symbol: "R",  label: "South African Rand",  region: "Africa" },
  { code: "NGN",  symbol: "₦",  label: "Nigerian Naira",      region: "Africa" },
  { code: "KES",  symbol: "KSh",label: "Kenyan Shilling",     region: "Africa" },
  { code: "EGP",  symbol: "£",  label: "Egyptian Pound",      region: "Africa" },
  { code: "GHS",  symbol: "₵",  label: "Ghanaian Cedi",       region: "Africa" },
  { code: "ETB",  symbol: "Br", label: "Ethiopian Birr",      region: "Africa" },
  { code: "MAD",  symbol: "MAD",label: "Moroccan Dirham",     region: "Africa" },
  { code: "TZS",  symbol: "TSh",label: "Tanzanian Shilling",  region: "Africa" },
  // ── Oceania ──
  { code: "AUD",  symbol: "A$", label: "Australian Dollar",   region: "Oceania" },
  { code: "NZD",  symbol: "NZ$",label: "New Zealand Dollar",  region: "Oceania" },
];

const LOCALE_MAP = {
  INR: "en-IN", JPY: "ja-JP", KRW: "ko-KR", CNY: "zh-CN",
  EUR: "de-DE", GBP: "en-GB", RUB: "ru-RU", SAR: "ar-SA",
  AED: "ar-AE", TRY: "tr-TR", BRL: "pt-BR", MXN: "es-MX",
};

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.settings?.currency) setCurrency(user.settings.currency);
      } catch (e) { /* ignore */ }
    }
  }, []);

  const formatCurrency = (amount) => {
    const locale = LOCALE_MAP[currency] || "en-US";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(amount);
    } catch {
      const sym = CURRENCIES.find(c => c.code === currency)?.symbol || currency;
      return `${sym}${Number(amount).toLocaleString()}`;
    }
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
