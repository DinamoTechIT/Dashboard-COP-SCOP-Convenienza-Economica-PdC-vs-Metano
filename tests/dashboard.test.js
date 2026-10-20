import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { HEAT_PUMP_SERIES, getDefaultSizes } from '../src/data/heat-pumps.js';
import { DEFAULT_INPUTS } from '../src/data/presets.js';
import { LWT_AXIS, computeDashboard, findMaxConvenientLwt } from '../src/core/dashboard.js';

const inputs = (overrides = {}) => ({ ...DEFAULT_INPUTS, sizes: getDefaultSizes(), ...overrides });

describe('findMaxConvenientLwt', () => {
  test("restituisce l'ultima mandata con efficienza sopra la bivalenza", () => {
    const curve = LWT_AXIS.map(t => 5 - (t - 35) * 0.1);
    assert.equal(findMaxConvenientLwt(curve, 3), 55);
  });

  test('restituisce null se la curva è sempre sotto la bivalenza', () => {
    assert.equal(findMaxConvenientLwt(LWT_AXIS.map(() => 1), 2), null);
  });
});

describe('computeDashboard', () => {
  test('produce un risultato per ogni serie con la taglia selezionata', () => {
    const view = computeDashboard(inputs());
    assert.deepEqual(view.models.map(m => m.series.id), HEAT_PUMP_SERIES.map(s => s.id));
    view.models.forEach(m => {
      assert.equal(m.sizeKey, getDefaultSizes()[m.series.id]);
      assert.equal(m.curve.length, LWT_AXIS.length);
    });
  });

  test('con i valori di default (COP, 45 °C, Tamb +5 °C) riproduce i risultati della dashboard originale', () => {
    const { models } = computeDashboard(inputs());
    const summary = Object.fromEntries(models.map(m => [m.series.id, [m.efficiency, Math.round(m.savings.yearlySaving)]]));
    assert.deepEqual(summary, {
      ebla: [3.45, 596],
      erla: [3.45, 596],
      erra: [3.56, 625],
      epra: [3.70, 661],
      epsk: [3.90, 707]
    });
  });

  test('i modelli fuori range non hanno efficienza né risparmio', () => {
    const { models } = computeDashboard(inputs({ lwt: 70 }));
    const ebla = models.find(m => m.series.id === 'ebla');
    assert.equal(ebla.efficiency, null);
    assert.equal(ebla.savings, null);
    assert.notEqual(models.find(m => m.series.id === 'epsk').savings, null);
  });

  test('il limite di convenienza non supera la mandata massima del modello', () => {
    const { models } = computeDashboard(inputs({ elecPrice: 0.10 }));
    models.forEach(m => assert.equal(m.maxConvenientLwt, m.model.maxLWT, m.series.id));
  });

  test('il riepilogo stagionale usa sempre gli SCOP certificati', () => {
    const { models, energy } = computeDashboard(inputs({ mode: 'cop', tamb: -7 }));
    models.forEach(m => {
      assert.equal(m.seasonal.scop35.costPerKwht, energy.netElecPrice / m.model.scop35);
      assert.equal(m.seasonal.scop55.costPerKwht, energy.netElecPrice / m.model.scop55);
    });
  });
});
