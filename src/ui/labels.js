// Nomi mostrati nella pagina: commerciali oppure generici (interruttore "Nomi generici dei modelli").

export const seriesName = (series, anonymous) => (anonymous ? series.alias : series.name);

// Taglia: sigla commerciale con potenza, oppure sola potenza nominale.
export const sizeLabel = (series, sizeKey, anonymous) =>
  (anonymous ? `${Number(sizeKey)} kW` : series.sizes[sizeKey].label);

// Modello completo (legenda dei grafici): sigla commerciale, oppure categoria e potenza.
export const modelLabel = (series, sizeKey, anonymous) =>
  (anonymous ? `${series.alias} ${Number(sizeKey)} kW` : series.sizes[sizeKey].label);
