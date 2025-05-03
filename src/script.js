// Variabile per memorizzare il grafico corrente
let currentChart = null;

// Funzione per formattare i numeri con due decimali
function formatNumber(num) {
  return parseFloat(num).toFixed(2);
}

// Funzione per aggiornare la tabella dei dati
function updateDataTable(dates, open_values, close_values, mean_values) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = ""; // Pulisce la tabella

  // Aggiunge una riga per ogni data
  for (let i = 0; i < dates.length; i++) {
    const row = document.createElement("tr");
    
    // Formattazione della data per una migliore leggibilità
    const dateCell = document.createElement("td");
    dateCell.textContent = dates[i];
    row.appendChild(dateCell);
    
    // Formattazione dei valori di apertura
    const openCell = document.createElement("td");
    openCell.textContent = formatNumber(open_values[i]);
    row.appendChild(openCell);
    
    // Formattazione dei valori di chiusura
    const closeCell = document.createElement("td");
    closeCell.textContent = formatNumber(close_values[i]);
    row.appendChild(closeCell);
    
    // Formattazione dei valori medi
    const meanCell = document.createElement("td");
    meanCell.textContent = formatNumber(mean_values[i]);
    row.appendChild(meanCell);
    
    tableBody.appendChild(row);
  }
}

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

  // Svuota eventuali messaggi di errore precedenti
  document.getElementById("error").textContent = "";
  
  // Mostra un messaggio di caricamento
  document.getElementById("error").textContent = "Caricamento dati...";

  // Effettua una richiesta all'API di Alpha Vantage
  fetch(
    `https://www.alphavantage.co/query?function=${interval}&symbol=${symbol}&apikey=${apiKey}`,
    { headers: { "User-Agent": "request" } }
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      // Rimuovi messaggio di caricamento
      document.getElementById("error").textContent = "";
      
      // Gestione degli errori restituiti dall'API
      if (data["Information"]) {
        document.getElementById("error").textContent = data["Information"];
        // Pulisce la tabella se c'è un errore
        document.getElementById("tableBody").innerHTML = "";
      } else if (data["Error Message"]) {
        document.getElementById("error").textContent = data["Error Message"];
        document.getElementById("tableBody").innerHTML = "";
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
        
        // Limita i dati a 71 elementi come nel grafico originale
        const limitedDates = dates.slice(0, 71).reverse();
        const limitedOpenValues = open_values.slice(0, 71).reverse();
        const limitedCloseValues = close_values.slice(0, 71).reverse();
        const limitedMeanValues = mean_values.slice(0, 71).reverse();

        // Crea un nuovo grafico con i dati recuperati
        const ctx = document.getElementById("myChart");
        currentChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: limitedDates,
            datasets: [
              {
                label: "Open values",
                data: limitedOpenValues,
                borderWidth: 1,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
              },
              {
                label: "Close values",
                data: limitedCloseValues,
                borderWidth: 1,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
              },
              {
                label: "Mean values",
                data: limitedMeanValues,
                borderWidth: 1,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          },
        });
        
        // Aggiorna la tabella con gli stessi dati del grafico
        updateDataTable(limitedDates, limitedOpenValues, limitedCloseValues, limitedMeanValues);
      }
    })
    .catch(error => {
      document.getElementById("error").textContent = "Errore nel recupero dei dati: " + error.message;
      document.getElementById("tableBody").innerHTML = "";
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
