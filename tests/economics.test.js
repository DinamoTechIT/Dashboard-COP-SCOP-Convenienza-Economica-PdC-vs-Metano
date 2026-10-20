import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DEFAULT_INPUTS } from '../src/data/presets.js';
import {
  computeEnergyContext,
  computeSavings,
  normalizeBoilerEfficiency,
  normalizePvShare,
  positiveOr
} from '../src/core/economics.js';

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

describe('normalizzazione input', () => {
  test('positiveOr usa il valore di riserva per input vuoti, nulli o negativi', () => {
    assert.equal(positiveOr('1.2', 9), 1.2);
    assert.equal(positiveOr('', 9), 9);
    assert.equal(positiveOr('0', 9), 9);
    assert.equal(positiveOr('-3', 9), 9);
    assert.equal(positiveOr('abc', 9), 9);
  });

  test('rendimento caldaia accetta percentuale o frazione', () => {
    assert.equal(normalizeBoilerEfficiency('86'), 0.86);
    assert.equal(normalizeBoilerEfficiency('0.92'), 0.92);
    assert.equal(normalizeBoilerEfficiency('1.05'), 1.05);
    assert.equal(normalizeBoilerEfficiency('105'), 1.05);
    assert.equal(normalizeBoilerEfficiency(''), DEFAULT_INPUTS.boilerEfficiency);
  });

  test('quota FV accetta percentuale o frazione ed è limitata al 100%', () => {
    assert.equal(normalizePvShare('35'), 0.35);
    assert.equal(normalizePvShare('0.35'), 0.35);
    assert.equal(normalizePvShare('0'), 0);
    assert.equal(normalizePvShare(''), 0);
    assert.equal(normalizePvShare('150'), 1);
  });
});

describe('computeEnergyContext', () => {
  const energy = computeEnergyContext(DEFAULT_INPUTS);

  test('calcola costo del kWh termico a gas e COP di bivalenza con i valori di default', () => {
    close(energy.netKwhPerSm3, 9.6 * 0.86);
    close(energy.gasCostPerKwht, 1.20 / (9.6 * 0.86));
    assert.equal(energy.gasCostPerKwht.toFixed(3), '0.145');
    assert.equal(energy.bivalentCop.toFixed(2), '2.13');
  });

  test('calcola spesa e fabbisogno termico annui', () => {
    close(energy.yearlyGasCost, 1560);
    assert.equal(Math.round(energy.yearlyThermalKwh), 10733);
  });

  test("l'autoconsumo FV riduce prezzo elettrico netto e COP di bivalenza", () => {
    const withPv = computeEnergyContext({ ...DEFAULT_INPUTS, pvShare: 0.35 });
    close(withPv.netElecPrice, 0.31 * 0.65);
    close(withPv.bivalentCop, energy.bivalentCop * 0.65);
  });
});

describe('computeSavings', () => {
  const energy = computeEnergyContext(DEFAULT_INPUTS);

  test('al COP di bivalenza il risparmio è nullo', () => {
    const savings = computeSavings(energy.bivalentCop, energy);
    close(savings.savingPct, 0);
    close(savings.yearlySaving, 0, 1e-6);
    assert.equal(savings.isConvenient, true);
  });

  test('risparmio annuo coerente con il risparmio percentuale', () => {
    const savings = computeSavings(3.45, energy);
    close(savings.costPerKwht, 0.31 / 3.45);
    close(savings.yearlySaving, energy.yearlyGasCost * savings.savingPct / 100, 1e-6);
    assert.equal(Math.round(savings.yearlySaving), 596);
    assert.equal(Math.round(savings.yearlyCost), 964);
  });

  test('sotto la bivalenza la PdC costa più del gas', () => {
    const savings = computeSavings(1.8, energy);
    assert.equal(savings.isConvenient, false);
    assert.ok(savings.savingPct < 0);
    assert.ok(savings.yearlySaving < 0);
  });
});
