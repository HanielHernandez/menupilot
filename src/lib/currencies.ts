export type CurrencyOption = {
  value: string;
  label: string;
  symbol: string;
};

export const currencies: CurrencyOption[] = [
  {
    value: "USD",
    label: "$ USD - US Dollar",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "€ EUR - Euro",
    symbol: "€",
  },
  {
    value: "NIO",
    label: "C$ NIO - Nicaraguan Córdoba",
    symbol: "C$",
  },
  {
    value: "MXN",
    label: "$ MXN - Mexican Peso",
    symbol: "$",
  },
  {
    value: "CRC",
    label: "₡ CRC - Costa Rican Colón",
    symbol: "₡",
  },
  {
    value: "COP",
    label: "$ COP - Colombian Peso",
    symbol: "$",
  },
  {
    value: "PEN",
    label: "S/ PEN - Peruvian Sol",
    symbol: "S/",
  },
  {
    value: "BRL",
    label: "R$ BRL - Brazilian Real",
    symbol: "R$",
  },
];

export const DEFAULT_CURRENCY = "USD";

const currencyByValue = new Map(
  currencies.map((currency) => [currency.value, currency]),
);

export function getCurrency(value?: string | null): CurrencyOption {
  if (value && currencyByValue.has(value)) {
    return currencyByValue.get(value)!;
  }
  return currencyByValue.get(DEFAULT_CURRENCY)!;
}

/** Format a menu price with the correct currency prefix/suffix. */
export function formatCurrencyAmount(
  price: number,
  currencyCode?: string | null,
): string {
  const currency = getCurrency(currencyCode);

  const amount = Number.isFinite(price) ? price : 0;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency.symbol}${formatted}`;
}
