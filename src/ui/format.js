// Formattazione numerica in italiano (virgola decimale, punto delle migliaia).

const LOCALE = 'it-IT';
const formatters = new Map();

function getFormatter(digits, signed) {
  const key = `${digits}|${signed}`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
      useGrouping: 'always',
      signDisplay: signed ? 'exceptZero' : 'auto'
    }));
  }
  return formatters.get(key);
}

export const formatNumber = (value, digits = 0) => getFormatter(digits, false).format(value);

export const formatEuro = (value, digits = 0) => `${formatNumber(value, digits)} €`;

export const formatSignedEuro = value => `${getFormatter(0, true).format(value)} €`;

export const formatSignedPercent = value => `${getFormatter(0, true).format(value)}%`;
