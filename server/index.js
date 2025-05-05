
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { fetchTeamEnergyData, fetchEvanChargeData } = require('./api');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend requests
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint to get the current charging station data
app.get('/api/data', (req, res) => {
  try {
    const teamEnergyPath = path.join(__dirname, '../public/data/teamEnergy.json');
    const evanChargePath = path.join(__dirname, '../public/data/evanCharge.json');
    
    // Check if both files exist
    if (fs.existsSync(teamEnergyPath) && fs.existsSync(evanChargePath)) {
      const teamEnergy = JSON.parse(fs.readFileSync(teamEnergyPath, 'utf8'));
      const evanCharge = JSON.parse(fs.readFileSync(evanChargePath, 'utf8'));
      
      return res.json({
        teamEnergy,
        evanCharge,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // If files don't exist, attempt to refresh the data first
      return refreshData(req, res);
    }
  } catch (error) {
    console.error('Error serving data:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve charging station data' });
  }
});

// Endpoint to refresh the data from APIs
app.get('/api/refresh', refreshData);

async function refreshData(req, res) {
  console.log('Starting data refresh process...');
  try {
    // Create the data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Fetch data from both APIs
    console.log('Fetching Team Energy data...');
    const teamEnergyData = await fetchTeamEnergyData();
    
    console.log('Fetching Evan Charge data...');
    const evanChargeData = await fetchEvanChargeData();

    if (!teamEnergyData.success || !evanChargeData.success) {
      const errors = [];
      if (!teamEnergyData.success) errors.push('Team Energy: ' + teamEnergyData.error);
      if (!evanChargeData.success) errors.push('Evan Charge: ' + evanChargeData.error);
      
      console.error('API fetch errors:', errors);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch data from APIs', 
        details: errors 
      });
    }

    // Save data to JSON files
    const teamEnergyPath = path.join(__dirname, '../public/data/teamEnergy.json');
    const evanChargePath = path.join(__dirname, '../public/data/evanCharge.json');

    console.log('Saving Team Energy data...');
    fs.writeFileSync(teamEnergyPath, JSON.stringify(teamEnergyData.data, null, 2));
    
    console.log('Saving Evan Charge data...');
    fs.writeFileSync(evanChargePath, JSON.stringify(evanChargeData.data, null, 2));

    console.log('Data refresh complete!');
    res.json({
      success: true,
      message: 'Data successfully refreshed',
      timestamp: new Date().toISOString(),
      stats: {
        teamEnergy: { stations: teamEnergyData.data.chargers?.length || 0 },
        evanCharge: { stations: evanChargeData.data.data?.length || 0 }
      }
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh data from APIs' });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

