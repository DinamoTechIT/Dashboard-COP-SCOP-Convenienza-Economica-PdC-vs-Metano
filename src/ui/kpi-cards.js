// Card riassuntive per ciascuna pompa di calore alla mandata selezionata.

import { getScopSource } from '../core/efficiency.js';
import { formatEuro, formatNumber, formatSignedEuro, formatSignedPercent } from './format.js';

const SCOP_LABELS = {
  certified: 'SCOP',
  interpolated: 'SCOP (interp.)',
  extrapolated: 'SCOP (stima)'
};

export function getEfficiencyLabel(mode, lwt) {
  return mode === 'scop' ? SCOP_LABELS[getScopSource(lwt)] : 'COP';
}

function renderActiveCard({ series, model, efficiency, savings }, { inputs, energy }) {
  const positive = savings.savingPct >= 0;

  return `
    <article class="card-glass rounded-2xl p-4 border-t-4 flex flex-col justify-between transition hover:scale-[1.01]" style="border-top-color: ${series.color}">
      <div>
        <div class="flex justify-between items-start">
          <div>
            <span class="text-sm font-black uppercase px-2.5 py-0.5 rounded" style="background:${series.bgLight}; color:${series.color}">${series.name}</span>
            <h4 class="text-xs text-slate-300 mt-1.5 font-bold">${model.label}</h4>
          </div>
          <span class="text-xs px-2 py-0.5 rounded font-bold border ${savings.isConvenient ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}">
            ${savings.isConvenient ? '✓ Conveniente' : '✗ Sotto Biv.'}
          </span>
        </div>

        <div class="mt-3 flex items-baseline justify-between border-b border-slate-800 pb-3">
          <div>
            <div class="text-xs text-slate-400 font-semibold">${getEfficiencyLabel(inputs.mode, inputs.lwt)} @ ${inputs.lwt}°C</div>
            <div class="text-4xl font-black text-white mt-0.5">${formatNumber(efficiency, 2)}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400 font-semibold">Costo kWht</div>
            <div class="text-2xl font-extrabold text-slate-100 mt-0.5">${formatEuro(savings.costPerKwht, 3)}</div>
          </div>
        </div>
      </div>

      <div class="mt-3 p-3.5 rounded-xl border-2 ${positive ? 'bg-emerald-950/50 border-emerald-500/50' : 'bg-rose-950/50 border-rose-500/50'}">
        <div class="flex justify-between items-center">
          <span class="text-xs font-extrabold uppercase tracking-wider ${positive ? 'text-emerald-300' : 'text-rose-300'}">Risparmio</span>
          <span class="text-3xl xl:text-4xl font-black tracking-tight ${positive ? 'text-emerald-400' : 'text-rose-400'}">
            ${formatSignedPercent(savings.savingPct)}
          </span>
        </div>
        <div class="mt-2 pt-2 border-t ${positive ? 'border-emerald-800/80' : 'border-rose-800/80'} flex justify-between items-baseline">
          <span class="text-xs font-bold text-slate-300">Annui:</span>
          <span class="text-2xl xl:text-3xl font-black text-white">
            ${formatSignedEuro(savings.yearlySaving)}<span class="text-xs font-semibold text-slate-300">/a</span>
          </span>
        </div>
        <div class="text-[11px] text-right text-slate-400 mt-1">
          Spesa PdC: <strong class="text-slate-200">${formatEuro(savings.yearlyCost)}/a</strong> vs ${formatEuro(energy.yearlyGasCost)}
        </div>
      </div>
    </article>
  `;
}

function renderOutOfRangeCard({ series, model }, { inputs }) {
  return `
    <article class="card-glass rounded-2xl p-4 border-t-4 border-t-slate-700 opacity-55 bg-slate-900/40 flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-sm font-black uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-400">${series.name}</span>
          <h4 class="text-xs text-slate-400 mt-1.5 font-bold">${model.label}</h4>
        </div>
        <span class="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded font-bold">Max ${model.maxLWT}°C</span>
      </div>
      <div class="my-auto py-8 text-center">
        <div class="text-base text-rose-400 font-black uppercase">Fuori Range Operativo</div>
        <div class="text-xs text-slate-400 mt-1">LWT ${inputs.lwt}°C supera il limite massimo di ${model.maxLWT}°C</div>
      </div>
    </article>
  `;
}

export function renderKpiCards(view) {
  document.getElementById('kpiContainer').innerHTML = view.models
    .map(m => (m.efficiency === null ? renderOutOfRangeCard(m, view) : renderActiveCard(m, view)))
    .join('');
}
