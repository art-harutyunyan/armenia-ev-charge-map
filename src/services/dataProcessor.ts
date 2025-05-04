
import fs from 'fs';
import path from 'path';
import { ChargingStation } from '@/types/chargers';
import { convertTeamEnergyToStandardFormat, convertEvanChargeToStandardFormat } from '@/utils/dataConverters';
import { RawTeamEnergyStation, RawEvanChargeStation } from './apis/types';

// API configurations
const TEAM_ENERGY_AUTH_URL = 'https://api.teamenergy.am/UserManagement/Login';
const TEAM_ENERGY_CHARGERS_URL = 'https://api.teamenergy.am/ChargePoint/search';
const EVAN_CHARGE_AUTH_URL = 'https://evcharge-api-prod.e-evan.com/api/users/auth/signin';
const EVAN_CHARGE_CHARGERS_URL = 'https://evcharge-api-prod.e-evan.com/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22';

// Function to fetch Team Energy data
async function fetchTeamEnergyData() {
  try {
    // Step 1: Authenticate
    const authResponse = await fetch(TEAM_ENERGY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestMode: false,
        password: "P0ker123$5!",
        phoneNumber: "+37493709944"
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Team Energy authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: Fetch chargers
    const chargersResponse = await fetch(TEAM_ENERGY_CHARGERS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noLatest: 1
      })
    });

    if (!chargersResponse.ok) {
      throw new Error(`Team Energy chargers fetch failed: ${chargersResponse.status}`);
    }

    const chargersData = await chargersResponse.json();
    
    // Step 3: Save to JSON file
    const dataPath = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataPath, 'teamEnergy.json'), 
      JSON.stringify(chargersData, null, 2)
    );
    
    console.log('Team Energy data saved successfully');
    return chargersData;
  } catch (error) {
    console.error('Failed to fetch Team Energy data:', error);
    return null;
  }
}

// Function to fetch Evan Charge data
async function fetchEvanChargeData() {
  try {
    // Step 1: Authenticate
    const authResponse = await fetch(EVAN_CHARGE_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: "+37493709944",
        password: "P0ker123$5!"
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Evan Charge authentication failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.data.token.accessToken;

    // Step 2: Fetch chargers
    const chargersResponse = await fetch(EVAN_CHARGE_CHARGERS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!chargersResponse.ok) {
      throw new Error(`Evan Charge chargers fetch failed: ${chargersResponse.status}`);
    }

    const chargersData = await chargersResponse.json();
    
    // Step 3: Save to JSON file
    const dataPath = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataPath, 'evanCharge.json'), 
      JSON.stringify(chargersData, null, 2)
    );
    
    console.log('Evan Charge data saved successfully');
    return chargersData;
  } catch (error) {
    console.error('Failed to fetch Evan Charge data:', error);
    return null;
  }
}

// Main function to fetch and process all data
export async function fetchAndProcessAllData() {
  const teamEnergyData = await fetchTeamEnergyData();
  const evanChargeData = await fetchEvanChargeData();
  
  // Process and convert to standard format if needed
  if (teamEnergyData && evanChargeData) {
    console.log('All data fetched and saved successfully');
  }
}

// Function to process data and convert to standard format (for front-end use)
export function processDataForFrontend(): ChargingStation[] {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data');
    
    // Read Team Energy data
    const teamEnergyRaw = JSON.parse(
      fs.readFileSync(path.join(dataPath, 'teamEnergy.json'), 'utf8')
    );
    const teamEnergyStations = teamEnergyRaw.chargers.map(
      (station: RawTeamEnergyStation) => convertTeamEnergyToStandardFormat(station)
    );
    
    // Read Evan Charge data
    const evanChargeRaw = JSON.parse(
      fs.readFileSync(path.join(dataPath, 'evanCharge.json'), 'utf8')
    );
    const evanChargeStations = evanChargeRaw.data.map(
      (station: RawEvanChargeStation) => convertEvanChargeToStandardFormat(station)
    );
    
    return [...teamEnergyStations, ...evanChargeStations];
  } catch (error) {
    console.error('Failed to process data for frontend:', error);
    return [];
  }
}

// Execute this script when running on the server side
if (require.main === module) {
  console.log('Starting data fetching process...');
  fetchAndProcessAllData()
    .then(() => {
      console.log('Data processing complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Data processing failed:', error);
      process.exit(1);
    });
}
