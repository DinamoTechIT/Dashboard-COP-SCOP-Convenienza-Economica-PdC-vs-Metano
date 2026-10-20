// Catalogo pompe di calore Daikin confrontate nella dashboard.
//
// Per ogni taglia:
//   - maxLWT  : temperatura di mandata massima ammessa [°C]
//   - scop35  : SCOP certificato EN 14825, clima medio, mandata 35 °C
//   - scop55  : SCOP certificato EN 14825, clima medio, mandata 55 °C
//   - cop7    : COP puntuale a Tamb = +7 °C (EN 14511) per le mandate indicate [°C → COP]
//
// L'ordine dell'array è l'ordine di visualizzazione (card, grafici, tabella).
// `techBonus` è il correttivo applicato al COP puntuale per le serie ad alta temperatura.

export const HEAT_PUMP_SERIES = [
  {
    id: 'ebla',
    name: 'EBLA',
    fullName: 'Altherma 3 M (Monoblocco R32)',
    selectorLabel: 'Monoblocco',
    refrigerant: 'R-32',
    color: '#38bdf8',
    bgLight: 'rgba(56, 189, 248, 0.15)',
    techBonus: 1.0,
    defaultSize: '11',
    sizes: {
      '09': { label: 'EBLA09D (9 kW)',  maxLWT: 60, scop35: 4.55, scop55: 3.26, cop7: { 35: 4.91, 45: 3.71, 55: 2.85, 60: 2.48 } },
      '11': { label: 'EBLA11D (11 kW)', maxLWT: 60, scop35: 4.52, scop55: 3.32, cop7: { 35: 4.83, 45: 3.66, 55: 2.82, 60: 2.45 } },
      '14': { label: 'EBLA14D (14 kW)', maxLWT: 60, scop35: 4.54, scop55: 3.36, cop7: { 35: 4.87, 45: 3.64, 55: 2.80, 60: 2.43 } },
      '16': { label: 'EBLA16D (16 kW)', maxLWT: 60, scop35: 4.49, scop55: 3.31, cop7: { 35: 4.53, 45: 3.51, 55: 2.72, 60: 2.38 } }
    }
  },
  {
    id: 'erla',
    name: 'ERLA',
    fullName: 'Altherma 3 R (Split BT R32)',
    selectorLabel: 'Split LT',
    refrigerant: 'R-32',
    color: '#818cf8',
    bgLight: 'rgba(129, 140, 248, 0.15)',
    techBonus: 1.0,
    defaultSize: '11',
    sizes: {
      '11': { label: 'ERLA11D (11 kW)', maxLWT: 60, scop35: 4.72, scop55: 3.27, cop7: { 35: 4.83, 45: 3.66, 55: 2.84, 60: 2.47 } },
      '14': { label: 'ERLA14D (14 kW)', maxLWT: 60, scop35: 4.68, scop55: 3.26, cop7: { 35: 4.87, 45: 3.64, 55: 2.82, 60: 2.45 } },
      '16': { label: 'ERLA16D (16 kW)', maxLWT: 60, scop35: 4.68, scop55: 3.35, cop7: { 35: 4.53, 45: 3.51, 55: 2.74, 60: 2.39 } }
    }
  },
  {
    id: 'erra',
    name: 'ERRA',
    fullName: 'Altherma 3 R MT (Split Media T.)',
    selectorLabel: 'Split MT',
    refrigerant: 'R-32',
    color: '#fbbf24',
    bgLight: 'rgba(251, 191, 36, 0.15)',
    techBonus: 1.0,
    defaultSize: '10',
    sizes: {
      '08': { label: 'ERRA08E (8 kW)',  maxLWT: 65, scop35: 4.56, scop55: 3.31, cop7: { 35: 4.92, 45: 3.80, 55: 2.98, 60: 2.62, 65: 2.30 } },
      '10': { label: 'ERRA10E (10 kW)', maxLWT: 65, scop35: 4.60, scop55: 3.36, cop7: { 35: 4.92, 45: 3.78, 55: 2.96, 60: 2.60, 65: 2.29 } },
      '12': { label: 'ERRA12E (12 kW)', maxLWT: 65, scop35: 4.63, scop55: 3.41, cop7: { 35: 4.85, 45: 3.73, 55: 2.92, 60: 2.57, 65: 2.26 } }
    }
  },
  {
    id: 'epra',
    name: 'EPRA',
    fullName: 'Altherma 3 H HT (Hydrosplit 70°C)',
    selectorLabel: 'Split HT R32',
    refrigerant: 'R-32',
    color: '#f97316',
    bgLight: 'rgba(249, 115, 22, 0.15)',
    techBonus: 1.008,
    defaultSize: '14',
    sizes: {
      '14': { label: 'EPRA14D (14 kW)', maxLWT: 70, scop35: 4.81, scop55: 3.58, cop7: { 35: 5.00, 45: 3.89, 55: 3.08, 60: 2.73, 65: 2.42, 70: 2.14 } },
      '16': { label: 'EPRA16D (16 kW)', maxLWT: 70, scop35: 4.74, scop55: 3.56, cop7: { 35: 5.00, 45: 3.87, 55: 3.06, 60: 2.71, 65: 2.40, 70: 2.12 } },
      '18': { label: 'EPRA18D (18 kW)', maxLWT: 70, scop35: 4.74, scop55: 3.58, cop7: { 35: 4.92, 45: 3.81, 55: 3.01, 60: 2.67, 65: 2.36, 70: 2.09 } }
    }
  },
  {
    id: 'epsk',
    name: 'EPSK',
    fullName: 'Altherma 4 H (Hydrosplit R290 75°C)',
    selectorLabel: 'Altherma 4 R290',
    refrigerant: 'R-290',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.15)',
    techBonus: 1.015,
    defaultSize: '10',
    sizes: {
      '06': { label: 'EPSK06A (6 kW)',  maxLWT: 70, scop35: 4.96, scop55: 3.78, cop7: { 35: 5.19, 45: 4.08, 55: 3.28, 60: 2.94, 65: 2.63, 70: 2.35 } },
      '08': { label: 'EPSK08A (8 kW)',  maxLWT: 75, scop35: 5.00, scop55: 3.86, cop7: { 35: 5.15, 45: 4.05, 55: 3.26, 60: 2.93, 65: 2.63, 70: 2.35, 75: 2.08 } },
      '10': { label: 'EPSK10A (10 kW)', maxLWT: 75, scop35: 5.05, scop55: 3.92, cop7: { 35: 5.18, 45: 4.08, 55: 3.29, 60: 2.95, 65: 2.65, 70: 2.37, 75: 2.10 } },
      '12': { label: 'EPSK12A (12 kW)', maxLWT: 75, scop35: 5.02, scop55: 3.90, cop7: { 35: 5.14, 45: 4.06, 55: 3.28, 60: 2.94, 65: 2.64, 70: 2.36, 75: 2.09 } },
      '14': { label: 'EPSK14A (14 kW)', maxLWT: 75, scop35: 4.88, scop55: 3.80, cop7: { 35: 4.96, 45: 3.92, 55: 3.16, 60: 2.84, 65: 2.55, 70: 2.28, 75: 2.02 } }
    }
  }
];

// Intervallo di mandata coperto dai dati: dal primo punto databook alla mandata più alta del catalogo.
export const LWT_MIN = 35;
export const LWT_MAX = Math.max(...HEAT_PUMP_SERIES.map(getSeriesMaxLwt));

export function getSeries(seriesId) {
  const series = HEAT_PUMP_SERIES.find(s => s.id === seriesId);
  if (!series) throw new Error(`Serie sconosciuta: ${seriesId}`);
  return series;
}

export function getModel(seriesId, sizeKey) {
  const model = getSeries(seriesId).sizes[sizeKey];
  if (!model) throw new Error(`Taglia sconosciuta: ${seriesId} ${sizeKey}`);
  return model;
}

// Mandata massima raggiungibile dalla taglia più "spinta" di una serie.
export function getSeriesMaxLwt(series) {
  return Math.max(...Object.values(series.sizes).map(m => m.maxLWT));
}

export function getDefaultSizes() {
  return Object.fromEntries(HEAT_PUMP_SERIES.map(s => [s.id, s.defaultSize]));
}
