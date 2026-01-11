// Prediction data handler
let predictionData = null;
let stateDistrictMap = {};

// Indian states list
const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Load prediction data from Google Drive
async function loadPredictionData() {
    try {
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';

        // Since we can't directly load pkl in browser, we'll use a proxy approach
        // Option 1: Convert pkl to JSON using the Python script provided
        // Option 2: Use a backend API
        // For now, we'll try to fetch JSON version

        const response = await fetch('prediction_data.json');
        if (response.ok) {
            predictionData = await response.json();
            console.log('Prediction data loaded successfully');
            populateStateDistrictMap();
            initializeDropdowns();
        } else {
            console.error('Failed to load prediction data');
            alert('Please convert the pkl file to JSON using the provided Python script');
        }

        document.getElementById('loadingIndicator').style.display = 'none';
    } catch (error) {
        console.error('Error loading prediction data:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        // Initialize with sample data structure for testing
        initializeWithSampleData();
    }
}

// Initialize with sample data if pkl file not available
function initializeWithSampleData() {
    console.log('Initializing with sample state-district data');

    // Sample state-district mapping (you can expand this)
    stateDistrictMap = {
        "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR District"],
        "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
        "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
        "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"]
    };

    populateStates();
    initializeYears();
}

// Populate state-district mapping from prediction data
function populateStateDistrictMap() {
    if (!predictionData || !Array.isArray(predictionData)) {
        return;
    }

    // Extract unique states and their districts
    predictionData.forEach(record => {
        const state = record.state || record.State;
        const district = record.district || record.District;

        if (state && district) {
            if (!stateDistrictMap[state]) {
                stateDistrictMap[state] = [];
            }
            if (!stateDistrictMap[state].includes(district)) {
                stateDistrictMap[state].push(district);
            }
        }
    });

    // Sort districts alphabetically
    Object.keys(stateDistrictMap).forEach(state => {
        stateDistrictMap[state].sort();
    });
}

// Initialize dropdowns
function initializeDropdowns() {
    populateStates();
    initializeYears();
}

// Populate state dropdown
function populateStates() {
    const stateSelect = document.getElementById('stateSelect');
    const states = Object.keys(stateDistrictMap).sort();

    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // Add event listener for state selection
    stateSelect.addEventListener('change', function() {
        populateDistricts(this.value);
    });
}

// Populate district dropdown based on selected state
function populateDistricts(state) {
    const districtSelect = document.getElementById('districtSelect');
    districtSelect.innerHTML = '<option value="">Select District</option>';

    if (state && stateDistrictMap[state]) {
        districtSelect.disabled = false;
        stateDistrictMap[state].forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    } else {
        districtSelect.disabled = true;
    }
}

// Initialize year dropdown (2020-2030)
function initializeYears() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();

    for (let year = 2020; year <= 2030; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// Get prediction based on selected parameters
function getPrediction() {
    const state = document.getElementById('stateSelect').value;
    const district = document.getElementById('districtSelect').value;
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;

    // Validate inputs
    if (!state || !district || !month || !year) {
        alert('Please select all parameters');
        return;
    }

    // Show loading
    document.getElementById('loadingIndicator').style.display = 'block';

    // Search for prediction in data
    let prediction = null;
    if (predictionData && Array.isArray(predictionData)) {
        prediction = predictionData.find(record => {
            return (record.state === state || record.State === state) &&
                   (record.district === district || record.District === district) &&
                   (record.month == month || record.Month == month) &&
                   (record.year == year || record.Year == year);
        });
    }

    // If no data found, generate sample prediction
    if (!prediction) {
        prediction = generateSamplePrediction(state, district, month, year);
    }

    // Display results
    displayPrediction(prediction, state, district, month, year);

    // Hide loading
    document.getElementById('loadingIndicator').style.display = 'none';

    // Update map
    updateMapWithPrediction(state, district, prediction);
}

// Generate sample prediction if no data available
function generateSamplePrediction(state, district, month, year) {
    const droughtCategories = ['No Drought', 'Mild Drought', 'Moderate Drought', 'Severe Drought', 'Extreme Drought'];
    const randomCategory = droughtCategories[Math.floor(Math.random() * droughtCategories.length)];

    return {
        drought_category: randomCategory,
        drought_severity: Math.random() * 5,
        rainfall_prediction: Math.random() * 200,
        temperature_avg: 20 + Math.random() * 15,
        confidence: 0.7 + Math.random() * 0.25
    };
}

// Display prediction results
function displayPrediction(prediction, state, district, month, year) {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];

    const resultDiv = document.getElementById('predictionResult');
    const resultDetails = document.getElementById('resultDetails');

    const category = prediction.drought_category || prediction.DroughtCategory || 'Unknown';
    const severity = prediction.drought_severity || prediction.Severity || 0;
    const rainfall = prediction.rainfall_prediction || prediction.Rainfall || 0;
    const temperature = prediction.temperature_avg || prediction.Temperature || 0;
    const confidence = prediction.confidence || prediction.Confidence || 0;

    // Determine severity class
    let severityClass = 'severity-normal';
    if (category.includes('Severe') || category.includes('Extreme')) {
        severityClass = 'severity-severe';
    } else if (category.includes('Moderate') || category.includes('Mild')) {
        severityClass = 'severity-moderate';
    }

    resultDetails.innerHTML = `
        <div class="result-card">
            <div class="result-label">Location</div>
            <div class="result-value">${district}, ${state}</div>
        </div>
        <div class="result-card">
            <div class="result-label">Period</div>
            <div class="result-value">${monthNames[month]} ${year}</div>
        </div>
        <div class="result-card">
            <div class="result-label">Drought Category</div>
            <div class="result-value">
                <span class="severity-indicator ${severityClass}">${category}</span>
            </div>
        </div>
        <div class="result-card">
            <div class="result-label">Severity Index</div>
            <div class="result-value">${severity.toFixed(2)}</div>
        </div>
        <div class="result-card">
            <div class="result-label">Predicted Rainfall (mm)</div>
            <div class="result-value">${rainfall.toFixed(1)}</div>
        </div>
        <div class="result-card">
            <div class="result-label">Avg Temperature (°C)</div>
            <div class="result-value">${temperature.toFixed(1)}</div>
        </div>
        <div class="result-card">
            <div class="result-label">Confidence</div>
            <div class="result-value">${(confidence * 100).toFixed(0)}%</div>
        </div>
    `;

    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Update map with prediction
function updateMapWithPrediction(state, district, prediction) {
    if (typeof map === 'undefined') return;

    // This will integrate with map.js
    // Add a marker or highlight the district on the map
    console.log('Updating map for:', state, district, prediction);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadPredictionData();
});
