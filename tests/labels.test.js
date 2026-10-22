import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { getSeries } from '../src/data/heat-pumps.js';
import { modelLabel, seriesName, sizeLabel } from '../src/ui/labels.js';

describe('nomi commerciali e generici', () => {
  const ebla = getSeries('ebla');
  const epsk = getSeries('epsk');

  test('con i nomi commerciali mostra sigle e modelli del databook', () => {
    assert.equal(seriesName(ebla, false), 'EBLA');
    assert.equal(sizeLabel(ebla, '11', false), 'EBLA11D (11 kW)');
    assert.equal(modelLabel(epsk, '06', false), 'EPSK06A (6 kW)');
  });

  test('con i nomi generici mostra solo categoria e potenza', () => {
    assert.equal(seriesName(ebla, true), 'BT Mono');
    assert.equal(sizeLabel(ebla, '09', true), '9 kW');
    assert.equal(modelLabel(epsk, '06', true), 'AT 6 kW');
  });
});
