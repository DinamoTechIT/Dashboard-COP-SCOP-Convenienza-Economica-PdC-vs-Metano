// Grafici Chart.js: curve di efficienza con soglia di bivalenza e spesa annua per tecnologia.
// Chart.js è caricato come script UMD (variabile globale `Chart`).

import { INDOOR_TEMPERATURE } from '../data/climate.js';
import { LWT_AXIS } from '../core/dashboard.js';
import { SCOP_CERTIFIED_LWT } from '../core/efficiency.js';
import { formatNumber, formatSignedEuro, formatSignedPercent } from './format.js';
import { modelLabel, seriesName } from './labels.js';

// Soglia e caldaia in colori neutri, distinti da quelli delle serie (EPSK è rossa).
const BIVALENCE_COLOR = '#f8fafc';
const GAS_COLOR = '#94a3b8';
const OUT_OF_RANGE_COLOR = 'rgba(100, 116, 139, 0.25)';
const AXIS_COLOR = '#94a3b8';
const GRID_COLOR = 'rgba(148, 163, 184, 0.1)';

// Oltre questo valore la retta di bivalenza resta fuori scala, per non schiacciare le curve.
const Y_AXIS_CAP = 10;

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  titleColor: '#38bdf8',
  bodyColor: '#f8fafc',
  borderColor: '#334155',
  borderWidth: 1
};

function axisTitle(text) {
  return { display: true, text, color: AXIS_COLOR };
}

function efficiencyAxisRange(datasets, bivalentCop) {
  const values = datasets.flatMap(d => d.data).filter(v => v !== null);
  const reference = Math.min(bivalentCop, Y_AXIS_CAP);
  const top = Math.max(...values, reference);
  const bottom = Math.min(...values, reference);
  return {
    min: Math.max(0, Math.floor((bottom - 0.2) * 2) / 2),
    max: Math.max(6, Math.ceil((top + 0.3) * 2) / 2)
  };
}

function buildEfficiencyDatasets({ inputs, energy, models }) {
  const extrapolatedFrom = SCOP_CERTIFIED_LWT[1];
  const datasets = models.map(({ series, sizeKey, curve }) => ({
    label: modelLabel(series, sizeKey, inputs.anonymous),
    data: curve,
    borderColor: series.color,
    backgroundColor: series.color,
    borderWidth: 3.5,
    pointRadius: LWT_AXIS.map(t => (t === inputs.lwt ? 7 : (t % 5 === 0 ? 3 : 0))),
    pointHoverRadius: 8,
    tension: 0.3,
    spanGaps: false,
    segment: {
      borderDash: ctx => (inputs.mode === 'scop' && LWT_AXIS[ctx.p0DataIndex] >= extrapolatedFrom ? [6, 4] : undefined)
    }
  }));

  const bivalentCop = Number(energy.bivalentCop.toFixed(2));
  datasets.push({
    label: `COP di Bivalenza (${formatNumber(bivalentCop, 2)}) - Pareggio vs Gas`,
    data: LWT_AXIS.map(() => bivalentCop),
    borderColor: BIVALENCE_COLOR,
    backgroundColor: 'rgba(248, 250, 252, 0.1)',
    borderWidth: 2.5,
    borderDash: [8, 4],
    pointRadius: 0,
    fill: false
  });
  return datasets;
}

function createEfficiencyChart(Chart, canvas) {
  return new Chart(canvas, {
    type: 'line',
    data: { labels: LWT_AXIS.map(t => `${t}°C`), datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { size: 12, weight: 'bold' } } },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => (ctx.raw === null ? null : `${ctx.dataset.label}: ${formatNumber(ctx.raw, 2)}`)
          }
        }
      },
      scales: {
        x: {
          title: axisTitle('Temperatura di Mandata LWT [°C]'),
          ticks: { color: AXIS_COLOR, maxTicksLimit: 10 },
          grid: { color: GRID_COLOR }
        },
        y: {
          title: axisTitle('COP Puntuale'),
          ticks: { color: AXIS_COLOR, callback: value => formatNumber(value, 1) },
          grid: { color: GRID_COLOR }
        }
      }
    }
  });
}

function createCostChart(Chart, canvas, getView) {
  return new Chart(canvas, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Spesa Annua [€/anno]', data: [], backgroundColor: [], borderRadius: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TOOLTIP_STYLE,
          callbacks: {
            label: ctx => {
              const { yearlyGasCost } = getView().energy;
              if (ctx.dataIndex === 0) return `Spesa Metano: ${formatNumber(ctx.raw)} €/anno`;
              const saving = yearlyGasCost - ctx.raw;
              const savingPct = (1 - ctx.raw / yearlyGasCost) * 100;
              return `Spesa PdC: ${formatNumber(ctx.raw)} €/anno (Risparmio: ${formatSignedEuro(saving)} | ${formatSignedPercent(savingPct)})`;
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#cbd5e1', font: { size: 12, weight: 'bold' } }, grid: { display: false } },
        y: {
          beginAtZero: true,
          title: axisTitle('Spesa Annua [€/anno]'),
          ticks: { color: AXIS_COLOR, callback: value => formatNumber(value) },
          grid: { color: GRID_COLOR }
        }
      }
    }
  });
}

function updateEfficiencyChart(chart, view) {
  const { inputs, energy } = view;
  const datasets = buildEfficiencyDatasets(view);
  const range = efficiencyAxisRange(datasets.slice(0, -1), energy.bivalentCop);

  document.getElementById('mainChartTitle').textContent = inputs.mode === 'scop'
    ? 'Curva SCOP Stagionale (35°C–55°C Certificato ErP + Stima >55°C) vs COP di Bivalenza'
    : `Curva COP Puntuale (Tamb = ${inputs.tamb}°C, Tint = ${INDOOR_TEMPERATURE}°C) vs COP di Bivalenza`;

  chart.data.datasets = datasets;
  chart.options.scales.y.title.text = inputs.mode === 'scop' ? 'SCOP Stagionale' : 'COP Puntuale';
  chart.options.scales.y.min = range.min;
  chart.options.scales.y.max = range.max;
  chart.update();
}

function updateCostChart(chart, { inputs, energy, models }) {
  document.getElementById('econChartSub').textContent =
    `Spesa annua a LWT ${inputs.lwt}°C per ${formatNumber(inputs.gasYearlySm3)} Sm³ di gas (${formatNumber(energy.yearlyThermalKwh)} kWht/anno)`;

  const [dataset] = chart.data.datasets;
  chart.data.labels = ['Caldaia Gas', ...models.map(m => {
    const name = seriesName(m.series, inputs.anonymous);
    return m.savings ? name : [name, 'fuori range'];
  })];
  dataset.data = [Math.round(energy.yearlyGasCost), ...models.map(m => (m.savings ? Math.round(m.savings.yearlyCost) : null))];
  dataset.backgroundColor = [GAS_COLOR, ...models.map(m => (m.savings ? m.series.color : OUT_OF_RANGE_COLOR))];
  chart.update();
}

function showChartsUnavailable(canvases) {
  canvases.forEach(canvas => {
    canvas.replaceWith(Object.assign(document.createElement('p'), {
      className: 'text-sm text-rose-300 p-4',
      textContent: 'Grafico non disponibile: impossibile caricare Chart.js (verifica la connessione).'
    }));
  });
}

export function createCharts({ efficiencyCanvas, costCanvas }) {
  const { Chart } = globalThis;
  if (!Chart) {
    showChartsUnavailable([efficiencyCanvas, costCanvas]);
    return { update() {} };
  }

  let latestView = null;
  const efficiencyChart = createEfficiencyChart(Chart, efficiencyCanvas);
  const costChart = createCostChart(Chart, costCanvas, () => latestView);

  return {
    update(view) {
      latestView = view;
      updateEfficiencyChart(efficiencyChart, view);
      updateCostChart(costChart, view);
    }
  };
}
