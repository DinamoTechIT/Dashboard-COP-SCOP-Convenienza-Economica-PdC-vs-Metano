# Dashboard COP / SCOP – Convenienza economica PdC vs Metano

Dashboard web per confrontare le pompe di calore Daikin **EBLA, ERLA, ERRA, EPRA ed EPSK** con
una caldaia a metano: COP puntuale e SCOP stagionale in funzione della temperatura di mandata,
**COP di bivalenza** (punto di pareggio economico), risparmio percentuale e risparmio in €/anno
sulla bolletta.

## Funzionalità

- **Due modalità di analisi**: COP puntuale (con scelta della temperatura esterna da −7 °C a
  +12 °C) oppure SCOP stagionale EN 14825.
- **Parametri economici**: consumo annuo di gas, prezzo di gas ed energia elettrica, rendimento
  della caldaia, quota di autoconsumo fotovoltaico; preset rapidi per tariffe, consumi e FV.
- **Temperatura di mandata** regolabile da 35 °C a 75 °C con indicazione del terminale di
  emissione tipico e dei limiti operativi di ogni serie.
- **Card per modello** con tipologia (bassa → alta temperatura), temperatura massima, fascia di
  prezzo indicativa, efficienza, costo del kWh termico, risparmio % e €/anno.
- **Grafici**: curve di efficienza con la soglia di bivalenza e spesa annua per tecnologia.
- **Tabella SCOP certificati** a 35 °C e 55 °C con risparmio annuo e mandata limite di
  convenienza.
- **Nomi generici dei modelli**: interruttore in fondo alla pagina che sostituisce sigle e marca
  con nomi per categoria (BT Mono, BT Split, MT, MAT, AT) e potenza in kW, utile per video e
  presentazioni. La scelta resta memorizzata nel browser; aggiungendo `?anonimo` all'indirizzo
  la pagina si apre già con i nomi generici.

Le formule e le ipotesi sono descritte in [docs/metodologia.md](docs/metodologia.md).

## Avvio rapido

La pagina è statica (HTML + moduli JavaScript), ma va servita via HTTP: aprendo `index.html`
con doppio clic il browser blocca i moduli ES.

```bash
npm install      # solo la prima volta (strumenti di sviluppo)
npm start        # http://localhost:8080
```

In alternativa, senza Node: `python3 -m http.server 8080` dalla cartella del progetto.

### Pubblicazione su GitHub Pages

In *Settings → Pages* scegliere **Deploy from a branch**, branch `main`, cartella `/ (root)`.
Il CSS compilato è già nel repository, quindi non serve alcun passaggio di build.

### Versione in file unico (offline)

```bash
npm run build:standalone
```

Genera `dist/dashboard-standalone.html`, un unico file con stili, Chart.js e codice incorporati:
si apre con doppio clic, funziona offline e si può inviare per email. Lo stesso file è
scaricabile come artefatto dalla pipeline CI (*Actions → CI → dashboard-standalone*).

## Struttura del progetto

```
index.html                 Struttura della pagina (nessuna logica inline)
assets/css/app.css         CSS compilato da Tailwind (generato, non modificare a mano)
src/
  main.js                  Punto di ingresso: collega controlli, calcolo e viste
  data/                    Dati e parametri, senza logica
    heat-pumps.js          Catalogo modelli: COP databook A7, SCOP 35/55 °C, mandata max
    climate.js             Coefficienti per temperatura esterna
    presets.js             Valori di default, PCI del metano, preset tariffe/consumi/FV
    emitters.js            Terminali di emissione e tacche dello slider
  core/                    Calcolo puro (testato, indipendente dal browser)
    efficiency.js          COP puntuale, SCOP stagionale, interpolazioni
    economics.js           Costo kWh termico, COP di bivalenza, risparmi
    dashboard.js           Aggregazione di tutti i risultati per la UI
  ui/                      Rendering nel DOM
    controls.js            Costruzione dei controlli, lettura input, preset, nomi generici
    labels.js              Nomi commerciali o generici di serie e modelli
    panels.js              Pannello economico, intestazione LWT, riepilogo bivalenza
    kpi-cards.js           Card per modello
    charts.js              Grafici Chart.js
    scop-table.js          Tabella SCOP certificati
    format.js              Formattazione numeri in italiano
  styles/app.css           Sorgente Tailwind
scripts/
  serve.mjs                Server statico per lo sviluppo
  build-standalone.mjs     Generazione del file unico offline
tests/                     Test (node:test) del motore di calcolo e dei dati
docs/metodologia.md        Formule e ipotesi
```

## Modifiche frequenti

**Aggiornare prezzi o preset** → `src/data/presets.js`.

**Aggiungere una taglia o una serie** → `src/data/heat-pumps.js`. Ogni serie ha colore, nome
generico (`alias`), categoria di temperatura (`temperatureClass`) e fascia di prezzo indicativa
(`priceLevel`, numero di banconote nelle card). Ogni taglia richiede
`label`, `maxLWT`, `scop35`, `scop55` e la tabella `cop7` (COP a +7 °C) da 35 °C fino a
`maxLWT`, con almeno il punto a 55 °C. Selettori, card, grafici e tabella si aggiornano da soli;
`npm test` verifica la coerenza dei dati inseriti. Se si aggiungono classi Tailwind nuove, va
rigenerato il CSS (sotto).

**Modificare lo stile** → classi Tailwind in `index.html` o nei template di `src/ui/`, poi:

```bash
npm run build:css    # oppure npm run watch:css durante lo sviluppo
```

Le classi vanno scritte per intero (es. `text-emerald-300`), non composte dinamicamente,
altrimenti Tailwind non le include nel CSS.

## Test

```bash
npm test
```

La CI (`.github/workflows/ci.yml`) esegue i test, verifica che `assets/css/app.css` sia
allineato ai sorgenti e produce la versione standalone.

## Dati e avvertenze

I valori di COP e SCOP provengono dai databook Daikin; le curve tra i punti certificati, le
correzioni per temperatura esterna e la stima dello SCOP oltre 55 °C sono approssimazioni utili
per un confronto preliminare, non per il dimensionamento. Il confronto economico considera
solo la componente energetica variabile (vedi [metodologia](docs/metodologia.md#5-ipotesi-e-limiti)).

## Licenza

[MIT](LICENSE)
