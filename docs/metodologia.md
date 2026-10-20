# Metodologia di calcolo

Questa pagina descrive come la dashboard calcola efficienza, costi e risparmi. Il codice
corrispondente è in [`src/core/`](../src/core).

## 1. Grandezze economiche (`src/core/economics.js`)

| Simbolo | Significato | Unità |
|---|---|---|
| `V` | consumo annuo di metano per il solo riscaldamento | Sm³/anno |
| `p_gas` | prezzo finito del metano | €/Sm³ |
| `PCI` | potere calorifico inferiore del metano (costante, 9,6) | kWh/Sm³ |
| `η` | rendimento stagionale della caldaia (riferito al PCI) | – |
| `p_el` | prezzo finito dell'energia elettrica da rete | €/kWhe |
| `f_FV` | quota dei consumi della PdC coperta da autoconsumo fotovoltaico | – |

```
Resa utile del gas          E_Sm³  = PCI × η                      [kWht/Sm³]
Costo del kWh termico a gas c_gas  = p_gas / E_Sm³                [€/kWht]
Prezzo elettrico netto      p_net  = p_el × (1 − f_FV)            [€/kWhe]
COP di bivalenza            COP_biv = p_net / c_gas               [–]
Fabbisogno termico annuo    Q      = V × E_Sm³                    [kWht/anno]
Spesa annua a gas           S_gas  = V × p_gas                    [€/anno]
```

Il **COP di bivalenza** (economica) è il COP a cui un kWh termico prodotto dalla pompa di
calore costa esattamente quanto uno prodotto dalla caldaia: sopra conviene la PdC, sotto il
metano.

Per ogni modello, data l'efficienza `ε` (COP o SCOP secondo la modalità):

```
Costo del kWh termico PdC   c_PdC  = p_net / ε
Risparmio percentuale       R%     = (1 − c_PdC / c_gas) × 100
Spesa annua PdC             S_PdC  = Q × c_PdC
Risparmio annuo             R€     = S_gas − S_PdC
```

## 2. COP puntuale (`getPointCop`)

1. Si interpola linearmente il COP databook a temperatura esterna +7 °C (`cop7`) alla mandata
   richiesta.
2. Si moltiplica per il coefficiente della temperatura esterna scelta (`base`, in
   `src/data/climate.js`).
3. Si applica un fattore di penalizzazione ad alta mandata che cresce linearmente da 35 °C a
   75 °C: `1 − (LWT − 35) / 40 × (1 − highTempPenalty)`.
4. Si applica il correttivo tecnologico della serie (`techBonus`: EPRA +0,8 %, EPSK +1,5 %).

Oltre la mandata massima del modello il COP non è definito e la card mostra
"Fuori Range Operativo".

## 3. SCOP stagionale (`getSeasonalScop`)

- **35 °C e 55 °C**: valori certificati EN 14825 (clima medio) dal databook.
- **Tra 35 e 55 °C**: interpolazione con leggera curvatura
  `SCOP = SCOP35 − ((LWT − 35) / 20)^0,92 × (SCOP35 − SCOP55)` (etichetta "SCOP (interp.)").
- **Oltre 55 °C**: stima `SCOP = SCOP55 × COP_A7(LWT) / COP_A7(55)`, cioè lo SCOP a 55 °C
  scalato con l'andamento del COP databook (etichetta "SCOP (stima)", tratto tratteggiato nel
  grafico).

## 4. Limite di convenienza

È la mandata più alta, a passo di 1 °C, a cui l'efficienza del modello (nella modalità attiva)
resta maggiore o uguale al COP di bivalenza.

## 5. Ipotesi e limiti

- Il confronto riguarda solo la **quota energia variabile**: non considera quote fisse del
  contratto gas (eliminabili passando al tutto elettrico), eventuale aumento di potenza del
  contatore, manutenzione, incentivi o costo d'acquisto.
- L'energia fotovoltaica autoconsumata è considerata a **costo nullo** (non si valuta il mancato
  ricavo dalla cessione in rete).
- I coefficienti per temperatura esterna, la penalizzazione ad alta mandata, il correttivo
  tecnologico e le curve tra i punti databook sono **stime** per l'analisi comparativa e non
  sostituiscono i dati di progetto del costruttore.
- Il fabbisogno termico si ricava dal consumo storico di gas: se la caldaia attuale ha un
  rendimento diverso da quello inserito, cambia anche il fabbisogno stimato.
