// Confronto economico tra caldaia a metano e pompa di calore.

import { DEFAULT_INPUTS, GAS_LHV_KWH_PER_SM3 } from '../data/presets.js';

// Valore numerico positivo, altrimenti il valore di riserva.
export function positiveOr(raw, fallback) {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

// Rendimento caldaia: accetta sia percentuale (86) sia frazione (0.86).
export function normalizeBoilerEfficiency(raw) {
  const value = positiveOr(raw, DEFAULT_INPUTS.boilerEfficiency);
  return value <= 1.5 ? value : value / 100;
}

// Quota di autoconsumo fotovoltaico: accetta sia percentuale (35) sia frazione (0.35).
export function normalizePvShare(raw) {
  const value = positiveOr(raw, 0);
  return Math.min(value < 1 ? value : value / 100, 1);
}

// Grandezze economiche comuni a tutti i modelli, a partire dai parametri inseriti.
export function computeEnergyContext({ gasYearlySm3, gasPrice, boilerEfficiency, elecPrice, pvShare }) {
  const netKwhPerSm3 = GAS_LHV_KWH_PER_SM3 * boilerEfficiency;
  const gasCostPerKwht = gasPrice / netKwhPerSm3;
  const netElecPrice = elecPrice * (1 - pvShare);

  return {
    netKwhPerSm3,
    gasCostPerKwht,
    netElecPrice,
    // COP a cui il kWh termico della PdC costa quanto quello della caldaia.
    bivalentCop: netElecPrice / gasCostPerKwht,
    yearlyGasCost: gasYearlySm3 * gasPrice,
    yearlyThermalKwh: gasYearlySm3 * netKwhPerSm3
  };
}

// Costo e risparmio della PdC con l'efficienza (COP o SCOP) indicata.
export function computeSavings(efficiency, energy) {
  const costPerKwht = energy.netElecPrice / efficiency;
  const yearlyCost = energy.yearlyThermalKwh * costPerKwht;

  return {
    costPerKwht,
    savingPct: (1 - costPerKwht / energy.gasCostPerKwht) * 100,
    yearlyCost,
    yearlySaving: energy.yearlyGasCost - yearlyCost,
    isConvenient: efficiency >= energy.bivalentCop
  };
}
