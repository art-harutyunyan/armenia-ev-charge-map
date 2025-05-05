
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
    console.log("Authenticating with Team Energy...");
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

    console.log("Team Energy auth response status:", authResponse.status);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Team Energy authentication failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    console.log("Team Energy authentication successful, token retrieved");

    // Step 2: Fetch chargers
    console.log("Fetching Team Energy chargers...");
    const chargersResponse = await fetch(TEAM_ENERGY_CHARGERS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noLatest: 1
      }),
    });

    console.log("Team Energy chargers response status:", chargersResponse.status);

    if (!chargersResponse.ok) {
      const errorText = await chargersResponse.text();
      throw new Error(`Team Energy chargers fetch failed: ${chargersResponse.status} - ${errorText}`);
    }

    const chargersData = await chargersResponse.json();
    console.log(`Retrieved ${chargersData.chargers?.length || 0} Team Energy chargers`);
    console.log("Sample Team Energy charger data:", chargersData.chargers?.[0]);
    
    // Step 3: Save to JSON file (we'll handle this differently in the browser)
    // Instead of directly writing to the filesystem, we'll return the data
    // which will be handled by our data refresh function
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
    console.log("Authenticating with Evan Charge...");
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

    console.log("Evan Charge auth response status:", authResponse.status);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Evan Charge authentication failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.token.accessToken;
    console.log("Evan Charge authentication successful, token retrieved");

    // Step 2: Fetch chargers
    console.log("Fetching Evan Charge chargers...");
    const chargersResponse = await fetch(EVAN_CHARGE_CHARGERS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    console.log("Evan Charge chargers response status:", chargersResponse.status);

    if (!chargersResponse.ok) {
      const errorText = await chargersResponse.text();
      throw new Error(`Evan Charge chargers fetch failed: ${chargersResponse.status} - ${errorText}`);
    }

    const chargersData = await chargersResponse.json();
    console.log(`Retrieved ${chargersData?.length || 0} Evan Charge chargers`);
    console.log("Sample Evan Charge charger data:", chargersData?.[0]);
    
    // Step 3: Return the data for handling in the refresh function
    const formattedData = { data: chargersData };
    return formattedData;
  } catch (error) {
    console.error('Failed to fetch Evan Charge data:', error);
    return null;
  }
}

// Main function to fetch and process all data
export async function fetchAndProcessAllData() {
  console.log("Starting data fetching process...");
  const teamEnergyData = await fetchTeamEnergyData();
  const evanChargeData = await fetchEvanChargeData();
  
  // Process and convert to standard format if needed
  if (teamEnergyData && evanChargeData) {
    console.log('All data fetched successfully');
    console.log(`Team Energy: ${teamEnergyData.chargers?.length || 0} chargers`);
    console.log(`Evan Charge: ${evanChargeData.data?.length || 0} chargers`);
    
    // In a browser environment, we need to handle the data differently than in Node.js
    // We'll return the data and the calling function will handle storage
    
    try {
      // Use fetch to send the data to our backend/API for storage
      const teamEnergyResponse = await fetch('/api/save-data?type=teamEnergy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamEnergyData),
      });
      
      const evanChargeResponse = await fetch('/api/save-data?type=evanCharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evanChargeData),
      });
      
      if (!teamEnergyResponse.ok || !evanChargeResponse.ok) {
        console.error('Failed to save data to backend');
      } else {
        console.log('Data saved successfully to backend');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
    
    return { teamEnergyData, evanChargeData };
  } else {
    console.error('One or more data sources failed to fetch');
    return null;
  }
}

// Function to process data and convert to standard format (for front-end use)
export async function processDataForFrontend(): Promise<ChargingStation[]> {
  try {
    // Read Team Energy data
    const teamEnergyResponse = await fetch('/data/teamEnergy.json');
    if (!teamEnergyResponse.ok) {
      throw new Error(`Failed to fetch Team Energy data: ${teamEnergyResponse.status}`);
    }
    
    const teamEnergyRaw = await teamEnergyResponse.json();
    const teamEnergyStations = teamEnergyRaw.chargers.map(
      (station: RawTeamEnergyStation) => convertTeamEnergyToStandardFormat(station)
    );
    
    // Read Evan Charge data
    const evanChargeResponse = await fetch('/data/evanCharge.json');
    if (!evanChargeResponse.ok) {
      throw new Error(`Failed to fetch Evan Charge data: ${evanChargeResponse.status}`);
    }
    
    const evanChargeRaw = await evanChargeResponse.json();
    const evanChargeStations = evanChargeRaw.data.map(
      (station: RawEvanChargeStation) => convertEvanChargeToStandardFormat(station)
    );
    
    return [...teamEnergyStations, ...evanChargeStations];
  } catch (error) {
    console.error('Failed to process data for frontend:', error);
    return [];
  }
}

// Remove the Node.js specific code that was causing the error
// This used to check if this file was being run directly in Node.js
// if (require.main === module) { ... }
