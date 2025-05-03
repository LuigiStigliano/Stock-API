from flask import Flask, request, jsonify
import sqlite3
import os
from flask_cors import CORS

# La libreria Flask-CORS è utilizzata per abilitare il supporto CORS (Cross-Origin Resource Sharing) nel server Flask.
# Questo è necessario perché l'applicazione web (che gira su un dominio o porta diversa, ad esempio tramite file locale o un server web) deve comunicare con il server Flask.
# Senza CORS, il browser bloccherebbe queste richieste per motivi di sicurezza.

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_NAME = os.path.join(DATA_DIR, "stock_data.db")

# Funzione per inizializzare il database SQLite
# Crea la tabella 'stock_data' se non esiste già
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS stock_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT,
            time_interval TEXT,
            date TEXT,
            open REAL,
            close REAL,
            mean REAL
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/save', methods=['POST'])
def save_data():
    # Endpoint per salvare i dati inviati dal client nel database
    try:
        data = request.get_json()
        labels = data.get('labels', [])
        open_values = data.get('open', [])
        close_values = data.get('close', [])
        mean_values = data.get('mean', [])
        symbol = data.get('symbol', '')
        time_interval = data.get('interval', '')

        # Validazione dei dati ricevuti
        if not (labels and open_values and close_values and mean_values and symbol and time_interval):
            return jsonify({"message": "Dati mancanti o incompleti."}), 400
        if not (len(labels) == len(open_values) == len(close_values) == len(mean_values)):
            return jsonify({"message": "Lunghezza degli array incoerente."}), 400

        # Connessione al database e inserimento dei dati
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        for date, open_v, close_v, mean_v in zip(labels, open_values, close_values, mean_values):
            c.execute('''
                INSERT INTO stock_data (symbol, time_interval, date, open, close, mean)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (symbol, time_interval, date, open_v, close_v, mean_v))
        conn.commit()
        conn.close()

        return jsonify({"message": "Dati salvati correttamente!"})
    except Exception as e:
        # Gestione degli errori durante il salvataggio
        return jsonify({"message": f"Errore durante il salvataggio: {str(e)}"}), 500

if __name__ == '__main__':
    # Inizializza il database e avvia il server Flask
    init_db()
    print(f"Database path: {DB_NAME}")
    app.run(debug=True)
