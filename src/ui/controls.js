// Controlli di input: costruzione dai dati, lettura dello stato, preset rapidi.

import { AMBIENT_CONDITIONS } from '../data/climate.js';
import { EMITTER_MARKS } from '../data/emitters.js';
import {
  HEAT_PUMP_SERIES, LWT_MAX, LWT_MIN, getDefaultSizes, getSeriesMaxLwt, getTemperatureClass
} from '../data/heat-pumps.js';
import { DEFAULT_INPUTS, GAS_CONSUMPTION_PRESETS, GAS_LHV_KWH_PER_SM3, PV_PRESETS, TARIFF_PRESETS } from '../data/presets.js';
import { normalizeBoilerEfficiency, normalizePvShare, positiveOr } from '../core/economics.js';
import { formatNumber } from './format.js';
import { seriesName, sizeLabel } from './labels.js';

const $ = id => document.getElementById(id);

// Preferenza "nomi generici" ricordata dal browser; ?anonimo nell'indirizzo la attiva comunque.
const ANONYMOUS_STORAGE_KEY = 'dashboard-pdc:nomi-generici';
const ANONYMOUS_URL_PARAM = 'anonimo';

const near = (a, b) => Math.abs(a - b) < 1e-6;

const PRESET_BASE_CLASS = 'px-2 py-2 text-xs rounded-lg border-2 transition text-center';
const PRESET_INACTIVE_CLASS = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';

const PRESET_GROUPS = [
  {
    id: 'tariff',
    containerId: 'tariffPresets',
    presets: TARIFF_PRESETS,
    activeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/70',
    caption: p => `${formatNumber(p.gasPrice, 2)}€ | ${formatNumber(p.elecPrice, 2)}€`,
    apply: p => {
      $('gasPrice').value = p.gasPrice.toFixed(2);
      $('elecPrice').value = p.elecPrice.toFixed(2);
    },
    isActive: (p, inputs) => near(inputs.gasPrice, p.gasPrice) && near(inputs.elecPrice, p.elecPrice)
  },
  {
    id: 'gas',
    containerId: 'gasPresets',
    presets: GAS_CONSUMPTION_PRESETS,
    activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/70',
    caption: p => `${formatNumber(p.gasYearlySm3)} Sm³/a`,
    apply: p => { $('gasYearlySm3').value = p.gasYearlySm3; },
    isActive: (p, inputs) => near(inputs.gasYearlySm3, p.gasYearlySm3)
  },
  {
    id: 'pv',
    containerId: 'pvPresets',
    presets: PV_PRESETS,
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/70',
    caption: p => `${p.pvPercent}%`,
    apply: p => { $('pvShare').value = p.pvPercent; },
    isActive: (p, inputs) => near(inputs.pvShare * 100, p.pvPercent)
  }
];

// Tacche dello slider: terminali di emissione + mandata massima di ciascuna categoria di PdC.
function getLwtMarks() {
  const seriesByMax = new Map();
  HEAT_PUMP_SERIES.forEach(series => {
    const maxLwt = getSeriesMaxLwt(series);
    seriesByMax.set(maxLwt, [...(seriesByMax.get(maxLwt) ?? []), series]);
  });
  const maxMarks = [...seriesByMax].map(([lwt, list]) => ({
    lwt,
    label: 'Max PdC',
    sublabel: [...new Set(list.map(s => getTemperatureClass(s).short))].join(' / '),
    color: list[0].color
  }));
  return [...EMITTER_MARKS, ...maxMarks].sort((a, b) => a.lwt - b.lwt);
}

function buildPresetButtons() {
  PRESET_GROUPS.forEach(group => {
    $(group.containerId).innerHTML = group.presets.map(p => `
      <button type="button" data-preset-group="${group.id}" data-preset-id="${p.id}" aria-pressed="false"
        class="${PRESET_BASE_CLASS} ${PRESET_INACTIVE_CLASS}">
        <div class="font-bold">${p.icon ? `${p.icon} ` : ''}${p.label}</div>
        <div class="text-[11px] mt-0.5 opacity-75">${group.caption(p)}</div>
      </button>
    `).join('');
  });
}

function buildAmbientSelect() {
  $('tambSelect').innerHTML = AMBIENT_CONDITIONS
    .map(c => `<option value="${c.tamb}">${c.label}</option>`)
    .join('');
}

function buildLwtControls() {
  const slider = $('lwtSlider');
  slider.min = LWT_MIN;
  slider.max = LWT_MAX;

  const marks = getLwtMarks();
  const span = LWT_MAX - LWT_MIN;

  $('lwtTicks').innerHTML = marks.map((mark, i) => {
    const translate = i === 0 ? '' : (i === marks.length - 1 ? '-translate-x-full text-right' : '-translate-x-1/2 text-center');
    return `
      <span class="absolute top-0 whitespace-nowrap ${translate}" style="left:${((mark.lwt - LWT_MIN) / span) * 100}%; color:${mark.color}">
        ${mark.lwt}°C<span class="hidden lg:block text-[10px] leading-tight font-semibold opacity-80">${mark.label}${mark.sublabel ? `<br>${mark.sublabel}` : ''}</span>
      </span>
    `;
  }).join('');

  $('lwtJumps').innerHTML = marks.map(mark => `
    <button type="button" data-lwt="${mark.lwt}" style="color:${mark.color}"
      class="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700">
      ${mark.lwt}°C (${mark.label}${mark.sublabel ? ` ${mark.sublabel}` : ''})
    </button>
  `).join('');
}

// I testi di etichette e opzioni sono scritti da applyNaming (commerciali o generici).
function buildSizeSelectors() {
  $('sizeSelectors').innerHTML = HEAT_PUMP_SERIES.map(series => `
    <label for="size_${series.id}" class="font-bold" style="color:${series.color}"></label>
    <select id="size_${series.id}" class="w-full bg-slate-800 text-white font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700">
      ${Object.keys(series.sizes).map(sizeKey => `<option value="${sizeKey}"></option>`).join('')}
    </select>
  `).join('');
}

function readAnonymousPreference() {
  const params = new URLSearchParams(window.location.search);
  if (params.has(ANONYMOUS_URL_PARAM)) return params.get(ANONYMOUS_URL_PARAM) !== '0';
  try {
    return localStorage.getItem(ANONYMOUS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveAnonymousPreference(anonymous) {
  try {
    localStorage.setItem(ANONYMOUS_STORAGE_KEY, anonymous ? '1' : '0');
  } catch {
    // Archiviazione non disponibile (navigazione privata): la scelta vale solo per questa visita.
  }
}

// Nomi commerciali o generici nei testi fissi della pagina e nei selettori delle taglie.
function applyNaming(anonymous) {
  document.querySelectorAll('[data-named]').forEach(el => {
    el.textContent = anonymous ? el.dataset.anonymous : el.dataset.named;
  });
  $('seriesList').textContent = HEAT_PUMP_SERIES.map(s => seriesName(s, anonymous)).join(' • ');

  HEAT_PUMP_SERIES.forEach((series, i) => {
    const description = anonymous ? getTemperatureClass(series).short : series.selectorLabel;
    document.querySelector(`label[for="size_${series.id}"]`).textContent =
      `${i + 1}. ${seriesName(series, anonymous)} (${description}):`;

    const mixedMaxLwt = new Set(Object.values(series.sizes).map(m => m.maxLWT)).size > 1;
    [...$(`size_${series.id}`).options].forEach(option => {
      const { maxLWT } = series.sizes[option.value];
      option.textContent = `${sizeLabel(series, option.value, anonymous)}${mixedMaxLwt ? ` – Max ${maxLWT}°C` : ''}`;
    });
  });
}

function applyDefaults() {
  $('modeSelect').value = DEFAULT_INPUTS.mode;
  $('tambSelect').value = String(DEFAULT_INPUTS.tamb);
  $('lwtSlider').value = DEFAULT_INPUTS.lwt;
  $('gasYearlySm3').value = DEFAULT_INPUTS.gasYearlySm3;
  $('gasPrice').value = DEFAULT_INPUTS.gasPrice.toFixed(2);
  $('boilerEff').value = Math.round(DEFAULT_INPUTS.boilerEfficiency * 100);
  $('elecPrice').value = DEFAULT_INPUTS.elecPrice.toFixed(2);
  $('pvShare').value = Math.round(DEFAULT_INPUTS.pvShare * 100);
  Object.entries(getDefaultSizes()).forEach(([seriesId, sizeKey]) => {
    $(`size_${seriesId}`).value = sizeKey;
  });
  $('anonymousToggle').checked = readAnonymousPreference();
}

export function initControls({ onChange }) {
  $('gasLhvDisplay').textContent = formatNumber(GAS_LHV_KWH_PER_SM3, 1);

  buildAmbientSelect();
  buildPresetButtons();
  buildLwtControls();
  buildSizeSelectors();
  applyDefaults();

  $('anonymousToggle').addEventListener('change', event => saveAnonymousPreference(event.target.checked));

  const root = document.querySelector('main');
  root.addEventListener('input', onChange);
  root.addEventListener('click', event => {
    const presetButton = event.target.closest('[data-preset-group]');
    if (presetButton) {
      const group = PRESET_GROUPS.find(g => g.id === presetButton.dataset.presetGroup);
      group.apply(group.presets.find(p => p.id === presetButton.dataset.presetId));
      onChange();
      return;
    }
    const lwtButton = event.target.closest('[data-lwt]');
    if (lwtButton) {
      $('lwtSlider').value = lwtButton.dataset.lwt;
      onChange();
    }
  });
}

export function readInputs() {
  return {
    mode: $('modeSelect').value,
    tamb: Number($('tambSelect').value),
    lwt: Number($('lwtSlider').value),
    gasYearlySm3: positiveOr($('gasYearlySm3').value, DEFAULT_INPUTS.gasYearlySm3),
    gasPrice: positiveOr($('gasPrice').value, DEFAULT_INPUTS.gasPrice),
    boilerEfficiency: normalizeBoilerEfficiency($('boilerEff').value),
    elecPrice: positiveOr($('elecPrice').value, DEFAULT_INPUTS.elecPrice),
    pvShare: normalizePvShare($('pvShare').value),
    sizes: Object.fromEntries(HEAT_PUMP_SERIES.map(s => [s.id, $(`size_${s.id}`).value])),
    anonymous: $('anonymousToggle').checked
  };
}

let appliedNaming = null;

// Allinea lo stato visivo dei controlli ai valori correnti (preset evidenziati, Tamb disattivata in SCOP,
// nomi commerciali o generici).
export function syncControls(inputs) {
  PRESET_GROUPS.forEach(group => {
    group.presets.forEach(p => {
      const button = document.querySelector(`[data-preset-group="${group.id}"][data-preset-id="${p.id}"]`);
      const active = group.isActive(p, inputs);
      button.className = `${PRESET_BASE_CLASS} ${active ? `${group.activeClass} font-bold` : PRESET_INACTIVE_CLASS}`;
      button.setAttribute('aria-pressed', String(active));
    });
  });

  const seasonal = inputs.mode === 'scop';
  $('tambSelect').disabled = seasonal;
  $('tambBox').classList.toggle('opacity-40', seasonal);

  if (appliedNaming !== inputs.anonymous) {
    applyNaming(inputs.anonymous);
    appliedNaming = inputs.anonymous;
  }
}
