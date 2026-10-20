// Calcolo completo della dashboard: dagli input dell'utente al modello dati per la UI.

import { HEAT_PUMP_SERIES, getModel, LWT_MIN, LWT_MAX } from '../data/heat-pumps.js';
import { computeEnergyContext, computeSavings } from './economics.js';
import { getEfficiency } from './efficiency.js';

export const LWT_AXIS = Array.from({ length: LWT_MAX - LWT_MIN + 1 }, (_, i) => LWT_MIN + i);

// Mandata più alta (a passo 1 °C) con efficienza non inferiore al COP di bivalenza.
export function findMaxConvenientLwt(curve, bivalentCop) {
  let lastConvenient = null;
  curve.forEach((efficiency, i) => {
    if (efficiency !== null && efficiency >= bivalentCop) lastConvenient = LWT_AXIS[i];
  });
  return lastConvenient;
}

export function computeDashboard(inputs) {
  const { mode, tamb, lwt, sizes } = inputs;
  const energy = computeEnergyContext(inputs);

  const models = HEAT_PUMP_SERIES.map(series => {
    const sizeKey = sizes[series.id];
    const model = getModel(series.id, sizeKey);
    const curve = LWT_AXIS.map(t => getEfficiency(series.id, sizeKey, t, { mode, tamb }));
    const efficiency = curve[LWT_AXIS.indexOf(lwt)] ?? null;

    return {
      series,
      sizeKey,
      model,
      curve,
      efficiency,
      savings: efficiency === null ? null : computeSavings(efficiency, energy),
      maxConvenientLwt: findMaxConvenientLwt(curve, energy.bivalentCop),
      seasonal: {
        scop35: computeSavings(model.scop35, energy),
        scop55: computeSavings(model.scop55, energy)
      }
    };
  });

  return { inputs, energy, models };
}
