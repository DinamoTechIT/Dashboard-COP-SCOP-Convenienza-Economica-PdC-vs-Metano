// Calcolo dell'efficienza delle pompe di calore: COP puntuale e SCOP stagionale.

import { getAmbientCondition } from '../data/climate.js';
import { getSeries, LWT_MIN } from '../data/heat-pumps.js';

// Salto termico su cui si distribuisce la penalizzazione ad alta temperatura (35 → 75 °C).
const LIFT_SPAN_K = 40;

// Mandate a cui lo SCOP è certificato EN 14825 e curvatura dell'interpolazione tra le due.
export const SCOP_CERTIFIED_LWT = [35, 55];
const SCOP_CURVE_EXPONENT = 0.92;

const round2 = value => Number(value.toFixed(2));

// Interpolazione lineare su una tabella { x: y }; null fuori dall'intervallo tabellato.
export function interpolate(table, x) {
  const xs = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (x < xs[0] || x > xs[xs.length - 1]) return null;
  for (let i = 0; i < xs.length - 1; i++) {
    const x1 = xs[i];
    const x2 = xs[i + 1];
    if (x >= x1 && x <= x2) {
      return table[x1] + ((x - x1) / (x2 - x1)) * (table[x2] - table[x1]);
    }
  }
  return table[xs[0]];
}

// COP puntuale alla mandata `lwt` con temperatura esterna `tamb`.
// Parte dal COP databook a A7 e lo corregge per Tamb e per la penalizzazione ad alta mandata.
export function getPointCop(seriesId, sizeKey, lwt, tamb) {
  const series = getSeries(seriesId);
  const model = series.sizes[sizeKey];
  if (lwt > model.maxLWT) return null;

  const copAtA7 = interpolate(model.cop7, lwt);
  if (copAtA7 === null) return null;

  const { base, highTempPenalty } = getAmbientCondition(tamb);
  const liftFactor = 1 - ((lwt - LWT_MIN) / LIFT_SPAN_K) * (1 - highTempPenalty);
  return round2(copAtA7 * base * liftFactor * series.techBonus);
}

// SCOP stagionale (clima medio). Certificato a 35 e 55 °C, interpolato tra i due,
// stimato oltre 55 °C scalando lo SCOP55 con l'andamento del COP databook a A7.
export function getSeasonalScop(seriesId, sizeKey, lwt) {
  const model = getSeries(seriesId).sizes[sizeKey];
  const [low, high] = SCOP_CERTIFIED_LWT;
  if (lwt > model.maxLWT || lwt < low) return null;

  if (lwt <= high) {
    const ratio = Math.pow((lwt - low) / (high - low), SCOP_CURVE_EXPONENT);
    return round2(model.scop35 - ratio * (model.scop35 - model.scop55));
  }
  return round2(model.scop55 * (interpolate(model.cop7, lwt) / model.cop7[high]));
}

// Provenienza del valore SCOP alla mandata indicata: certificato, interpolato o estrapolato.
export function getScopSource(lwt) {
  const [low, high] = SCOP_CERTIFIED_LWT;
  if (lwt === low || lwt === high) return 'certified';
  return lwt < high ? 'interpolated' : 'extrapolated';
}

// Efficienza secondo la modalità di analisi: 'cop' (puntuale, dipende da Tamb) o 'scop' (stagionale).
export function getEfficiency(seriesId, sizeKey, lwt, { mode, tamb }) {
  return mode === 'scop'
    ? getSeasonalScop(seriesId, sizeKey, lwt)
    : getPointCop(seriesId, sizeKey, lwt, tamb);
}
