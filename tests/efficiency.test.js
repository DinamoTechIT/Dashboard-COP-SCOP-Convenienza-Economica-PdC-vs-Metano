import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { HEAT_PUMP_SERIES } from '../src/data/heat-pumps.js';
import { getEfficiency, getPointCop, getScopSource, getSeasonalScop, interpolate } from '../src/core/efficiency.js';

describe('interpolate', () => {
  const table = { 35: 5, 45: 4, 55: 3 };

  test('restituisce i punti tabellati e interpola linearmente tra di essi', () => {
    assert.equal(interpolate(table, 35), 5);
    assert.equal(interpolate(table, 55), 3);
    assert.equal(interpolate(table, 40), 4.5);
    assert.equal(interpolate(table, 50), 3.5);
  });

  test('restituisce null fuori intervallo', () => {
    assert.equal(interpolate(table, 34), null);
    assert.equal(interpolate(table, 56), null);
  });
});

describe('getPointCop', () => {
  test('a Tamb +7 °C coincide con il databook per le serie senza correttivo', () => {
    assert.equal(getPointCop('ebla', '11', 35, 7), 4.83);
    assert.equal(getPointCop('erra', '10', 65, 7), 2.29);
  });

  test('applica il correttivo tecnologico delle serie ad alta temperatura', () => {
    assert.equal(getPointCop('epsk', '10', 35, 7), Number((5.18 * 1.015).toFixed(2)));
    assert.equal(getPointCop('epra', '14', 35, 7), Number((5.00 * 1.008).toFixed(2)));
  });

  test('riduce il COP con il freddo e con la mandata alta', () => {
    // EBLA11 a 45 °C, Tamb +5 °C: 3,66 × 0,945 × (1 − 10/40 × 0,01)
    assert.equal(getPointCop('ebla', '11', 45, 5), 3.45);
    for (const series of HEAT_PUMP_SERIES) {
      const sizeKey = series.defaultSize;
      assert.ok(getPointCop(series.id, sizeKey, 45, -7) < getPointCop(series.id, sizeKey, 45, 7), series.id);
      assert.ok(getPointCop(series.id, sizeKey, 55, 5) < getPointCop(series.id, sizeKey, 35, 5), series.id);
    }
  });

  test('restituisce null oltre la mandata massima del modello', () => {
    assert.equal(getPointCop('ebla', '11', 61, 7), null);
    assert.equal(getPointCop('epsk', '06', 71, 7), null);
    assert.notEqual(getPointCop('epsk', '08', 75, 7), null);
  });
});

describe('getSeasonalScop', () => {
  test('restituisce i valori certificati a 35 e 55 °C', () => {
    for (const series of HEAT_PUMP_SERIES) {
      for (const [sizeKey, model] of Object.entries(series.sizes)) {
        assert.equal(getSeasonalScop(series.id, sizeKey, 35), model.scop35, `${model.label} @35`);
        assert.equal(getSeasonalScop(series.id, sizeKey, 55), model.scop55, `${model.label} @55`);
      }
    }
  });

  test('è decrescente su tutto il campo di mandata', () => {
    for (const series of HEAT_PUMP_SERIES) {
      const sizeKey = series.defaultSize;
      const maxLwt = series.sizes[sizeKey].maxLWT;
      let previous = Infinity;
      for (let lwt = 35; lwt <= maxLwt; lwt++) {
        const scop = getSeasonalScop(series.id, sizeKey, lwt);
        assert.ok(scop <= previous, `${series.id} @${lwt}`);
        previous = scop;
      }
    }
  });

  test('oltre 55 °C scala lo SCOP55 con il rapporto dei COP databook A7 (senza correttivo tecnologico)', () => {
    // EPSK10A a 60 °C: 3,92 × 2,95 / 3,29
    assert.equal(getSeasonalScop('epsk', '10', 60), 3.51);
    // EBLA11D a 60 °C: 3,32 × 2,45 / 2,82
    assert.equal(getSeasonalScop('ebla', '11', 60), 2.88);
  });

  test('restituisce null oltre la mandata massima', () => {
    assert.equal(getSeasonalScop('erra', '10', 66), null);
  });
});

describe('getScopSource / getEfficiency', () => {
  test('classifica la provenienza del valore SCOP', () => {
    assert.equal(getScopSource(35), 'certified');
    assert.equal(getScopSource(45), 'interpolated');
    assert.equal(getScopSource(55), 'certified');
    assert.equal(getScopSource(60), 'extrapolated');
  });

  test('sceglie COP o SCOP in base alla modalità', () => {
    assert.equal(getEfficiency('ebla', '11', 45, { mode: 'cop', tamb: 5 }), getPointCop('ebla', '11', 45, 5));
    assert.equal(getEfficiency('ebla', '11', 45, { mode: 'scop', tamb: 5 }), getSeasonalScop('ebla', '11', 45));
  });
});
