// Variabile per memorizzare il grafico corrente
let currentChart = null;

// Funzione per recuperare i dati azionari dall'API di Alpha Vantage
function getStockData() {
  // Recupera il simbolo selezionato o imposta un valore predefinito
  const symbol =
    document.getElementById("select_symbol").value === "Seleziona simbolo"
      ? "IBM"
      : document.getElementById("select_symbol").value;

  // Recupera l'intervallo selezionato o imposta un valore predefinito
  const interval =
    document.getElementById("select_interval").value === "Seleziona intervallo"
      ? "TIME_SERIES_DAILY"
      : document.getElementById("select_interval").value;

  // Chiave API per accedere ai dati (impostata su "demo" per test; NON inserire chiavi reali in questo file)
  const apiKey = "demo";

  // Effettua una richiesta all'API di Alpha Vantage
  fetch(
    `https://www.alphavantage.co/query?function=${interval}&symbol=${symbol}&apikey=${apiKey}`,
    { headers: { "User-Agent": "request" } }
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      // Gestione degli errori restituiti dall'API
      if (data["Information"]) {
        document.getElementById("error").textContent = data["Information"];
      } else {
        // Estrazione dei dati di apertura, chiusura e date
        const priceSeries =
          interval === "TIME_SERIES_DAILY"
            ? data["Time Series (Daily)"]
            : data["Monthly Time Series"];

        const open_values = [];
        const close_values = [];
        const dates = [];

        for (let key in priceSeries) {
          open_values.push(Number(priceSeries[key]["1. open"]));
          close_values.push(Number(priceSeries[key]["4. close"]));
          dates.push(String(key));
        }

        // Distrugge il grafico precedente se esiste
        if (currentChart) {
          currentChart.destroy();
        }

        // Calcola i valori medi
        const mean_values = [];
        for (let i = 0; i < open_values.length; i++) {
          mean_values.push((open_values[i] + close_values[i]) / 2);
        }

        // Crea un nuovo grafico con i dati recuperati
        const ctx = document.getElementById("myChart");
        currentChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: dates.slice(0, 71).reverse(),
            datasets: [
              {
                label: "Open values",
                data: open_values.slice(0, 71).reverse(),
                borderWidth: 1,
              },
              {
                label: "Close values",
                data: close_values.slice(0, 71).reverse(),
                borderWidth: 1,
              },
              {
                label: "Mean values",
                data: mean_values.slice(0, 71).reverse(),
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    });
}

// Funzione per salvare i dati del grafico nel database
function saveChartDataToDb() {
  // Controlla se esiste un grafico corrente
  if (!currentChart) {
    alert("Nessun grafico disponibile da salvare.");
    return;
  }

  // Prepara i dati da inviare al server
  const chartData = {
    labels: currentChart.data.labels,
    open: currentChart.data.datasets[0].data,
    close: currentChart.data.datasets[1].data,
    mean: currentChart.data.datasets[2].data,
    symbol: document.getElementById("select_symbol").value,
    interval: document.getElementById("select_interval").value
  };

  // Effettua una richiesta POST al server Flask
  fetch("http://127.0.0.1:5000/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(chartData)
  })
    .then(response => response.json().then(data => ({status: response.status, body: data})))
    .then(({status, body}) => {
      if (status !== 200) {
        alert("Errore: " + body.message);
      } else {
        alert(body.message);
      }
    })
    .catch(error => {
      alert("Errore durante il salvataggio: " + error);
    });
}