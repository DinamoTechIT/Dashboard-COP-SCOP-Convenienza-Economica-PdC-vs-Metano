// Punto di ingresso: collega i controlli al calcolo e aggiorna tutte le viste.

import { computeDashboard } from './core/dashboard.js';
import { createCharts } from './ui/charts.js';
import { initControls, readInputs, syncControls } from './ui/controls.js';
import { renderKpiCards } from './ui/kpi-cards.js';
import { renderBivalenceSummary, renderEnergyPanel, renderLwtPanel } from './ui/panels.js';
import { renderScopTable } from './ui/scop-table.js';

function init() {
  const charts = createCharts({
    efficiencyCanvas: document.getElementById('copChart'),
    costCanvas: document.getElementById('econChart')
  });

  const render = () => {
    const inputs = readInputs();
    const view = computeDashboard(inputs);

    syncControls(inputs);
    renderEnergyPanel(view);
    renderLwtPanel(view);
    renderKpiCards(view);
    renderBivalenceSummary(view);
    renderScopTable(view);
    charts.update(view);
  };

  // Un solo aggiornamento per frame, anche trascinando lo slider.
  let pendingFrame = 0;
  const scheduleRender = () => {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      render();
    });
  };

  initControls({ onChange: scheduleRender });
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
