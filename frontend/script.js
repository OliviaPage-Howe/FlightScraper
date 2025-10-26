document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("trackBtn");
  const flightsTable = document.getElementById("flights");
  const tbody = document.getElementById("flightBody");

  // Helper: format time
  function formatTime(datetime) {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Render flight results in table
  function renderTable(flights) {
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!flights || flights.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No flights found.</td></tr>`;
      return;
    }

    flights.forEach(f => {
      const row = `
        <tr>
          <td>${f.airline}</td>
          <td>$${Number.parseFloat(f.price).toFixed(2)}</td>
          <td>${formatTime(f.departure)}</td>
          <td>${formatTime(f.arrival)}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  }

  // Home page button click
  if (btn) {
    btn.addEventListener("click", async () => {
      const origin = document.getElementById("from").value.trim().toUpperCase();
      const destination = document.getElementById("to").value.trim().toUpperCase();
      const date = document.getElementById("date").value;

      if (!origin || !destination || !date) {
        alert("Please fill out all fields!");
        return;
      }

      const url = `http://127.0.0.1:5000/api/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        localStorage.setItem("flights", JSON.stringify(data));
        window.location.href = "results.html";
      } catch (error) {
        console.error("Error fetching flight data:", error);
        alert("Unable to fetch flights. Please try again later.");
      }
    });
  }

  // Results page render
  if (flightsTable && localStorage.getItem("flights")) {
    try {
      const flights = JSON.parse(localStorage.getItem("flights"));
      renderTable(flights);
    } catch (e) {
      console.error("Failed to load flight data:", e);
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="4">Could not load results.</td></tr>`;
      }
    }
  }
});
