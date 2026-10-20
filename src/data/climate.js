// Condizioni di temperatura esterna (Tamb) per il calcolo del COP puntuale.
//
//   - base            : moltiplicatore del COP rispetto alla condizione nominale A7
//   - highTempPenalty : penalizzazione (o bonus, se > 1) che cresce linearmente
//                       da mandata 35 °C fino a +40 K (mandata 75 °C)

export const AMBIENT_CONDITIONS = [
  { tamb: -7, label: '-7 °C (Clima Rigido)',        base: 0.635, highTempPenalty: 0.93 },
  { tamb: 2,  label: '+2 °C (Inverno / Defrost)',   base: 0.815, highTempPenalty: 0.97 },
  { tamb: 5,  label: '+5 °C (Standard Richiesto)',  base: 0.945, highTempPenalty: 0.99 },
  { tamb: 7,  label: '+7 °C (Nominale EN 14511)',   base: 1.00,  highTempPenalty: 1.00 },
  { tamb: 12, label: '+12 °C (Mezza Stagione)',     base: 1.24,  highTempPenalty: 1.03 }
];

// Temperatura interna di riferimento indicata nei titoli dei grafici.
export const INDOOR_TEMPERATURE = 20;

export function getAmbientCondition(tamb) {
  const condition = AMBIENT_CONDITIONS.find(c => c.tamb === Number(tamb));
  if (!condition) throw new Error(`Temperatura esterna non prevista: ${tamb}`);
  return condition;
}
