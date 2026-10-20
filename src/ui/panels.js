// Pannelli di sintesi: grandezze economiche, intestazione LWT, riepilogo bivalenza.

import { getEmitterBand } from '../data/emitters.js';
import { formatEuro, formatNumber } from './format.js';

const $ = id => document.getElementById(id);

const EMITTER_TONE_CLASS = {
  emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  sky: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
};

export function renderEnergyPanel({ energy }) {
  $('yearlyGasEuroDisplay').textContent = `${formatEuro(energy.yearlyGasCost)}/a`;
  $('yearlyThermalKwhDisplay').textContent = formatNumber(energy.yearlyThermalKwh);
  $('netGasKwh').textContent = formatNumber(energy.netKwhPerSm3, 2);
  $('netElecDisplay').textContent = `${formatNumber(energy.netElecPrice, 3)} €/kWhe`;
  $('gasKwhtCostDisplay').textContent = formatEuro(energy.gasCostPerKwht, 3);
  $('copBivDisplay').textContent = formatNumber(energy.bivalentCop, 2);
}

export function renderLwtPanel({ inputs }) {
  const { lwt, mode } = inputs;
  $('lwtDisplay').textContent = `${lwt}°C`;

  const band = getEmitterBand(lwt);
  const badge = $('emitterBadge');
  badge.textContent = band.text;
  badge.className = `text-xs font-bold px-3 py-1 rounded-full border ${EMITTER_TONE_CLASS[band.tone]}`;

  $('scopWarningBanner').classList.toggle('hidden', mode !== 'scop');
  $('limitModeNote').textContent = mode === 'scop' ? '(su SCOP)' : `(su COP a Tamb ${inputs.tamb}°C)`;
}

function describeLimit({ maxConvenientLwt, model }) {
  if (maxConvenientLwt === null) return '<span class="text-rose-400 font-bold">Mai conveniente</span>';
  if (maxConvenientLwt === model.maxLWT) {
    return `<span class="text-emerald-400 font-bold">Fino a ${maxConvenientLwt}°C (Tutto il range)</span>`;
  }
  return `<span class="text-amber-300 font-bold">Fino a ${maxConvenientLwt}°C</span>`;
}

export function renderBivalenceSummary({ energy, models }) {
  $('bivalenceSummaryBox').innerHTML = `
    <div class="font-bold text-amber-300 mb-1.5 text-xs">📌 Temperatura LWT massima prima di andare in perdita rispetto al Metano (COP Biv = ${formatNumber(energy.bivalentCop, 2)}):</div>
    <div class="grid grid-cols-2 gap-1.5 text-xs">
      ${models.map(m => `<div><strong style="color:${m.series.color}">${m.series.name}:</strong> ${describeLimit(m)}</div>`).join('')}
    </div>
  `;
}
