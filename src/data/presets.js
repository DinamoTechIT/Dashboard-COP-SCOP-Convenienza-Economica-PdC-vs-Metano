// Parametri economici di default e preset rapidi del pannello superiore.

// Potere calorifico inferiore del metano [kWh/Sm³], base su cui è riferito il rendimento caldaia.
export const GAS_LHV_KWH_PER_SM3 = 9.6;

export const DEFAULT_INPUTS = {
  mode: 'cop',
  tamb: 5,
  lwt: 45,
  gasYearlySm3: 1300,
  gasPrice: 1.20,          // €/Sm³
  boilerEfficiency: 0.86,  // frazione
  elecPrice: 0.31,         // €/kWhe
  pvShare: 0               // frazione
};

// Prezzi "finiti" variabili (tutto compreso) di gas ed energia elettrica.
export const TARIFF_PRESETS = [
  { id: 'min', icon: '📉', label: 'Minimo 5a',     gasPrice: 0.95, elecPrice: 0.22 },
  { id: 'avg', icon: '⚖️', label: 'Media Attuale', gasPrice: 1.20, elecPrice: 0.31 },
  { id: 'max', icon: '📈', label: 'Picco ARERA',   gasPrice: 1.62, elecPrice: 0.43 }
];

// Consumo annuo di metano per il solo riscaldamento [Sm³/anno].
export const GAS_CONSUMPTION_PRESETS = [
  { id: 'low',  icon: '🏠', label: 'Basso', gasYearlySm3: 700 },
  { id: 'mid',  icon: '🏡', label: 'Medio', gasYearlySm3: 1300 },
  { id: 'high', icon: '🏰', label: 'Alto',  gasYearlySm3: 2200 }
];

// Quota di energia elettrica della PdC coperta da autoconsumo fotovoltaico in inverno [%].
export const PV_PRESETS = [
  { id: 'none',    icon: '',   label: 'No FV',   pvPercent: 0 },
  { id: 'pv',      icon: '☀️', label: 'Solo FV', pvPercent: 20 },
  { id: 'battery', icon: '🔋', label: 'FV+Batt', pvPercent: 35 },
  { id: 'xl',      icon: '⚡', label: 'FV XL',   pvPercent: 50 }
];
