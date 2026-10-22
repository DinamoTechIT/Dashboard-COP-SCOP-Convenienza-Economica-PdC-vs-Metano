// Tabella riepilogativa SCOP certificati (35 °C e 55 °C) con risparmio annuo.

import { formatEuro, formatNumber, formatSignedEuro, formatSignedPercent } from './format.js';
import { seriesName, sizeLabel } from './labels.js';

const COLUMN_TONES = {
  35: { scop: 'text-emerald-400', cell: 'bg-emerald-950/10', pill: 'bg-emerald-500/20 border-emerald-500/40' },
  55: { scop: 'text-amber-300', cell: 'bg-amber-950/10', pill: 'bg-amber-500/20 border-amber-500/40' }
};

function renderSeasonalCells(scop, savings, tone) {
  return `
    <td class="py-4 px-3 text-center text-xl font-black ${tone.scop} ${tone.cell}">${formatNumber(scop, 2)}</td>
    <td class="py-4 px-3 text-center font-bold text-slate-200 ${tone.cell}">${formatEuro(savings.costPerKwht, 3)}/kWht</td>
    <td class="py-4 px-3 text-center whitespace-nowrap ${tone.cell}">
      <span class="text-xl font-black ${savings.savingPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatSignedPercent(savings.savingPct)}</span>
      <span class="ml-2 px-2.5 py-1 rounded-lg text-base font-black text-white border ${tone.pill}">${formatSignedEuro(savings.yearlySaving)}/a</span>
    </td>
  `;
}

function renderRow({ series, sizeKey, model, seasonal, maxConvenientLwt }, anonymous) {
  return `
    <tr class="hover:bg-slate-800/40 transition">
      <th scope="row" class="py-4 px-4 font-bold text-white text-base text-left whitespace-nowrap">
        <span class="inline-block w-3 h-3 rounded-full mr-2" style="background:${series.color}"></span>
        ${seriesName(series, anonymous)} <span class="text-xs font-normal text-slate-400">(${sizeLabel(series, sizeKey, anonymous)})</span>
      </th>
      <td class="py-4 px-3 text-center font-extrabold text-slate-200 text-base">${model.maxLWT}°C</td>
      ${renderSeasonalCells(model.scop35, seasonal.scop35, COLUMN_TONES[35])}
      ${renderSeasonalCells(model.scop55, seasonal.scop55, COLUMN_TONES[55])}
      <td class="py-4 px-3 text-center font-bold whitespace-nowrap">
        ${maxConvenientLwt === null
          ? '<span class="text-rose-400 font-extrabold">Sotto Bivalenza</span>'
          : `<span class="px-3 py-1 rounded-lg bg-slate-800 text-sky-300 border border-slate-700 font-extrabold">Fino a ${maxConvenientLwt}°C</span>`}
      </td>
    </tr>
  `;
}

export function renderScopTable({ inputs, models }) {
  document.getElementById('scopTableBody').innerHTML = models.map(m => renderRow(m, inputs.anonymous)).join('');
}
