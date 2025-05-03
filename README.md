# Stock Market Graph Application

## Descrizione
Questa applicazione consente di visualizzare grafici dei dati di mercato azionario utilizzando l'API di Alpha Vantage. Gli utenti possono selezionare un simbolo azionario e un intervallo di tempo per generare un grafico con i valori di apertura, chiusura e medi. Inoltre, i dati del grafico possono essere salvati in un database SQLite tramite un server Flask.

## Requisiti
- Python 3.x
- Un browser web moderno o l'estensione Live Preview di VSCode

## Installazione
1. Crea un ambiente virtuale eseguendo:
   ```bash
   python -m venv .venv
   ```
2. Attiva l'ambiente virtuale:
   - Su Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - Su macOS/Linux:
     ```bash
     source .venv/bin/activate
     ```
3. Installa le dipendenze richieste eseguendo:
   ```bash
   pip install -r requirements.txt
   ```

## Esecuzione
### Avvio del server Flask
1. Apri un terminale nella directory del progetto.
2. Esegui il comando:
   ```bash
   python save_to_db.py
   ```
3. Il server sarà disponibile all'indirizzo `http://127.0.0.1:5000`.

### Avvio dell'applicazione web
1. Apri il file `index.html` in un browser web o con l'estensione Live Preview di VSCode.
2. Seleziona un simbolo azionario e un intervallo di tempo dai menu a tendina.
3. Visualizza il grafico generato.
4. Per salvare i dati del grafico nel database, clicca sul pulsante "Salva dati su DB".

## Struttura del Progetto

La struttura della cartella principale è la seguente:

```
Stock-API/
├── src/                 # Cartella principale per il codice sorgente
│   ├── script.js        # Logica client-side per il recupero e la visualizzazione dei dati
│   ├── index.html       # Interfaccia utente dell'applicazione web
│   └── save_to_db.py    # Server Flask per salvare i dati nel database SQLite
├── requirements.txt     # Dipendenze Python necessarie per il backend
├── README.md            # Documentazione del progetto
├── LICENSE              # Licenza MIT
└── stock_data.db        # Database SQLite generato automaticamente (dopo il primo avvio)
```

## Note importanti
- **Non inserire mai chiavi API reali nei file di codice o nel repository pubblico.**
- L'API key utilizzata è impostata su `demo` per scopi di test. **Con la chiave demo è possibile ottenere dati solo per il simbolo IBM.** Per utilizzare l'applicazione con dati reali, sostituisci `demo` con una chiave API valida di Alpha Vantage, ma NON committare la chiave reale.
- Assicurati che il server Flask sia in esecuzione prima di tentare di salvare i dati nel database.

## Licenza
Questo progetto è distribuito con licenza MIT. Vedi il file LICENSE per i dettagli.
