// Terminali di emissione associati alla temperatura di mandata.

// Fasce usate per il badge accanto al valore LWT selezionato (prima fascia con lwt <= upTo).
export const EMITTER_BANDS = [
  { upTo: 38,       text: 'Impianto Radiante (35°C)',       tone: 'emerald' },
  { upTo: 48,       text: 'Fan Coil / Radiatori BT',        tone: 'sky' },
  { upTo: 55,       text: 'Radiatori Media Temp. (≤55°C)',  tone: 'amber' },
  { upTo: 65,       text: 'Radiatori Alta Temp. (60-65°C)', tone: 'orange' },
  { upTo: Infinity, text: 'Radiatori Ghisa (>65°C)',        tone: 'rose' }
];

// Mandate di riferimento mostrate come tacche sullo slider e pulsanti di salto rapido.
// Le mandate massime delle singole serie vengono aggiunte dai dati del catalogo.
export const EMITTER_MARKS = [
  { lwt: 35, label: 'Radiante',     color: '#6ee7b7' },
  { lwt: 45, label: 'Fan Coil',     color: '#e2e8f0' },
  { lwt: 55, label: 'Radiatori MT', color: '#fcd34d' }
];

export function getEmitterBand(lwt) {
  return EMITTER_BANDS.find(band => lwt <= band.upTo);
}
