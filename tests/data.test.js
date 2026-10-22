// Controlli di coerenza sui dati del catalogo: utili quando si aggiunge o si modifica un modello.

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, test } from 'node:test';

import { AMBIENT_CONDITIONS } from '../src/data/climate.js';
import { HEAT_PUMP_SERIES, LWT_MAX, LWT_MIN, TEMPERATURE_CLASSES } from '../src/data/heat-pumps.js';
import { DEFAULT_INPUTS, GAS_CONSUMPTION_PRESETS, PV_PRESETS, TARIFF_PRESETS } from '../src/data/presets.js';

describe('catalogo pompe di calore', () => {
  test('identificativi delle serie univoci e taglia di default esistente', () => {
    assert.equal(new Set(HEAT_PUMP_SERIES.map(s => s.id)).size, HEAT_PUMP_SERIES.length);
    HEAT_PUMP_SERIES.forEach(s => assert.ok(s.sizes[s.defaultSize], `${s.id}: defaultSize ${s.defaultSize}`));
  });

  test('ogni serie ha categoria di temperatura valida e fascia di prezzo (intero positivo)', () => {
    HEAT_PUMP_SERIES.forEach(s => {
      assert.ok(TEMPERATURE_CLASSES[s.temperatureClass], `${s.id}: temperatureClass ${s.temperatureClass}`);
      assert.ok(Number.isInteger(s.priceLevel) && s.priceLevel > 0, `${s.id}: priceLevel ${s.priceLevel}`);
    });
  });

  test('i nomi generici sono univoci e non contengono il nome commerciale', () => {
    assert.equal(new Set(HEAT_PUMP_SERIES.map(s => s.alias)).size, HEAT_PUMP_SERIES.length);
    HEAT_PUMP_SERIES.forEach(s => assert.ok(!s.alias.toUpperCase().includes(s.name), `${s.id}: alias ${s.alias}`));
  });

  for (const series of HEAT_PUMP_SERIES) {
    for (const [sizeKey, model] of Object.entries(series.sizes)) {
      test(`${model.label}: dati databook coerenti`, () => {
        const points = Object.keys(model.cop7).map(Number).sort((a, b) => a - b);
        assert.equal(points[0], LWT_MIN, 'il COP A7 deve partire da 35 °C');
        assert.ok(points.includes(55), 'serve il COP A7 a 55 °C per stimare lo SCOP oltre 55 °C');
        assert.equal(points.at(-1), model.maxLWT, 'ultimo punto COP A7 = mandata massima');
        assert.ok(model.maxLWT <= LWT_MAX);
        assert.ok(model.scop35 > model.scop55, 'SCOP 35 °C > SCOP 55 °C');
        points.slice(1).forEach((t, i) => assert.ok(model.cop7[t] < model.cop7[points[i]], `COP decrescente a ${t} °C`));
        assert.ok(model.label.includes(sizeKey), `etichetta coerente con la taglia ${sizeKey}`);
        assert.ok(model.label.includes(`(${Number(sizeKey)} kW)`), 'la chiave della taglia è la potenza in kW');
      });
    }
  }
});

describe('parametri e preset', () => {
  test('la temperatura esterna di default è tra quelle previste', () => {
    assert.ok(AMBIENT_CONDITIONS.some(c => c.tamb === DEFAULT_INPUTS.tamb));
  });

  test('identificativi dei preset univoci in ogni gruppo', () => {
    for (const presets of [TARIFF_PRESETS, GAS_CONSUMPTION_PRESETS, PV_PRESETS]) {
      assert.equal(new Set(presets.map(p => p.id)).size, presets.length);
    }
  });

  test('la versione di Chart.js caricata da CDN coincide con quella in package.json', async () => {
    const [html, pkg] = await Promise.all([
      readFile(new URL('../index.html', import.meta.url), 'utf8'),
      readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse)
    ]);
    const cdnVersion = html.match(/chart\.js@([\d.]+)\//)?.[1];
    assert.equal(cdnVersion, pkg.devDependencies['chart.js']);
  });
});
