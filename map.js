// map.js – state‑level averaged markers
let map;
let droughtLayer;
let predictionData = [];

// State center coordinates
const STATE_COORDINATES = {
  "Andhra Pradesh": [15.9129, 79.7400],
  "Arunachal Pradesh": [28.2180, 94.7278],
  "Assam": [26.2006, 92.9376],
  "Bihar": [25.0961, 85.3131],
  "Chhattisgarh": [21.2787, 81.8661],
  "Goa": [15.2993, 74.1240],
  "Gujarat": [22.2587, 71.1924],
  "Haryana": [29.0588, 76.0856],
  "Himachal Pradesh": [31.1048, 77.1734],
  "Jharkhand": [23.6102, 85.2799],
  "Karnataka": [15.3173, 75.7139],
  "Kerala": [10.8505, 76.2711],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Maharashtra": [19.7515, 75.7139],
  "Manipur": [24.6637, 93.9063],
  "Meghalaya": [25.4670, 91.3662],
  "Mizoram": [23.1645, 92.9376],
  "Nagaland": [26.1584, 94.5624],
  "Odisha": [20.9517, 85.0985],
  "Punjab": [31.1471, 75.3412],
  "Rajasthan": [27.0238, 74.2179],
  "Sikkim": [27.5330, 88.5122],
  "Tamil Nadu": [11.1271, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Tripura": [23.9408, 91.9882],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Uttarakhand": [30.0668, 79.0193],
  "West Bengal": [22.9868, 87.8550],
  "Andaman and Nicobar Islands": [11.7401, 92.6586],
  "Chandigarh": [30.7333, 76.7794],
  "Dadra and Nagar Haveli and Daman and Diu": [20.4283, 72.8397],
  "Delhi": [28.7041, 77.1025],
  "Jammu and Kashmir": [33.7782, 76.5762],
  "Ladakh": [34.1526, 77.5771],
  "Lakshadweep": [10.5667, 72.6417],
  "Puducherry": [11.9416, 79.8083]
};

// Category → color
const DROUGHT_COLORS = {
  "Exceptional Drought": "#730000",
  "Extreme Drought": "#E60000",
  "Severe Drought": "#FFAA00",
  "Moderate Drought": "#FCD37F",
  "Slightly Dry": "#FFFF00",
  "Near Normal": "#FFFFFF",
  "Slightly Wet": "#A6F28F",
  "Moderate Wet": "#00AAFF",
  "No Drought": "#4CAF50",
  "Mild Drought": "#FFEB3B"
};

// Relaxed thresholds so more states appear normal / mild
function severityToCategory(severity) {
  if (severity <= 0.8) return "No Drought";
  if (severity <= 1.8) return "Slightly Dry";      // <- was "Mild Drought"
  if (severity <= 2.8) return "Moderate Drought";
  if (severity <= 3.8) return "Severe Drought";
  return "Extreme Drought";
}


// Load prediction data + populate dropdowns
async function loadMapPredictions() {
  try {
    const response = await fetch("prediction_data.json");
    if (!response.ok) {
      console.log("Map: could not load prediction_data.json");
      return;
    }
    predictionData = await response.json(); // state,district,year,month,drought_severity,drought_category,confidence [file:5]

    const statesWithData = [...new Set(predictionData.map(p => p.state))];

    const stateSelect = document.getElementById("stateSelect");
    if (stateSelect) {
      stateSelect.innerHTML = '<option value="">Select a state</option>';
      statesWithData.sort().forEach(state => {
        const opt = document.createElement("option");
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
      });
    }

    // Date dropdown 2024–2026 only
    const ymSet = new Set();
    predictionData.forEach(p => {
      if (p.year >= 2024 && p.year <= 2026) {
        ymSet.add(`${p.year}-${p.month}`);
      }
    });

    const dateSelect = document.getElementById("dateSelect");
    if (dateSelect) {
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const sorted = Array.from(ymSet).sort((a,b)=>{
        const [ya,ma]=a.split("-").map(Number);
        const [yb,mb]=b.split("-").map(Number);
        return ya*12+ma - (yb*12+mb);
      });

      dateSelect.innerHTML = "";
      sorted.forEach(s => {
        const [y,m] = s.split("-").map(Number);
        const opt = document.createElement("option");
        opt.value = `${y}-${String(m).padStart(2,"0")}`;
        opt.textContent = `${monthNames[m-1]} ${y}`;
        dateSelect.appendChild(opt);
      });

      if (sorted.some(d => d === "2026-1")) {
        dateSelect.value = "2026-01";
      }
    }

    console.log(`Map: loaded ${predictionData.length} predictions for ${statesWithData.length} states`);
  } catch (err) {
    console.log("Map: error loading prediction data", err);
  }
}

// Init map
function initMap() {
  map = L.map("map").setView([20.5937, 78.9629], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18
  }).addTo(map);
  loadMapPredictions();
  console.log("Map initialized");
}

// Update on controls
function updateMap() {
  const state = document.getElementById("stateSelect")?.value;
  const timeScale = document.getElementById("timeScale")?.value || 6;
  const dateSelect = document.getElementById("dateSelect")?.value || "2024-01";

  updateTimeScaleInfo(timeScale);

  if (droughtLayer) {
    map.removeLayer(droughtLayer);
    droughtLayer = null;
  }

  if (state) {
    showStateMarker(state, dateSelect);
  }
}

// One translucent, big circle per state
function showStateMarker(state, dateStr) {
  const [year, month] = dateStr.split("-").map(Number);

  const statePredictions = predictionData.filter(
    p => p.state === state && p.year === year && p.month === month
  );

  console.log(`Found ${statePredictions.length} records for ${state} in ${year}-${month}`);

  droughtLayer = L.layerGroup();

  if (statePredictions.length === 0) {
    if (STATE_COORDINATES[state]) {
      map.setView(STATE_COORDINATES[state], 6);
    }
    droughtLayer.addTo(map);
    return;
  }

  // Use median severity to reduce effect of a few very dry districts
  const severities = statePredictions
    .map(p => p.drought_severity)
    .sort((a,b)=>a-b);
  const mid = Math.floor(severities.length / 2);
  const avgSeverity = severities.length % 2 === 0
    ? (severities[mid - 1] + severities[mid]) / 2
    : severities[mid];

  const category = severityToCategory(avgSeverity);
  const color = DROUGHT_COLORS[category] || "#808080";

  const center = STATE_COORDINATES[state];
  if (!center) {
    console.log(`No center coordinate for state: ${state}`);
    return;
  }

  // Bigger, translucent circle
  const circle = L.circleMarker(center, {
    radius: 40,       // big visual footprint
    fillColor: color,
    color: color,
    weight: 2,
    opacity: 0.4,     // border semi‑transparent
    fillOpacity: 0.6 // fill translucent
  });

  const popupHtml = `
    <div style="font-family: Arial, sans-serif;">
      <h4 style="margin: 0 0 8px 0;">${state}</h4>
      <p style="margin: 4px 0;"><strong>Median severity:</strong> ${avgSeverity.toFixed(2)}</p>
      <p style="margin: 4px 0;"><strong>State category:</strong> ${category}</p>
      <p style="margin: 4px 0;"><strong>Samples:</strong> ${statePredictions.length} district‑month records</p>
    </div>
  `;

  circle.bindPopup(popupHtml);
  droughtLayer.addLayer(circle);
  droughtLayer.addTo(map);

  map.setView(center, 6);
}

// Time‑scale info (unchanged)
function updateTimeScaleInfo(months) {
  const infoTexts = {
    1: "A 1-month view shows immediate, short-term drought conditions affecting current agricultural activities.",
    3: "A 3-month period reflects seasonal patterns and is useful for assessing impacts on a single growing season.",
    6: "A 6-month dry period can produce detrimental agricultural impacts extending over two seasons leading to less productivity, crop failure, pasture decline, lost income and strain on communities.",
    12: "A 12-month period captures long-term drought trends and water resource impacts across multiple seasons."
  };
  const infoElement = document.querySelector(".time-scale-info p");
  if (infoElement && infoTexts[months]) {
    infoElement.textContent = infoTexts[months];
  }
}

// DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMap);
} else {
  initMap();
}
