
import { ChargingStation } from '@/types/chargers';
import { TeamEnergyStation } from '@/types/chargers';
import { mockChargers } from './apis/mockData';

// API base URL - change this to your production URL when deploying
const API_BASE_URL = 'http://localhost:3001';

// Helper function to map TeamEnergy connector types to standard format
function mapTeamEnergyPortType(connectorType: string): 'TYPE_1' | 'TYPE_2' | 'CCS' | 'CHADEMO' | 'OTHER' {
  const type = String(connectorType).toUpperCase();
  
  if (type.includes('TYPE1') || type.includes('TYPE 1')) {
    return 'TYPE_1';
  } else if (type.includes('TYPE2') || type.includes('TYPE 2')) {
    return 'TYPE_2';
  } else if (type.includes('CCS') || type.includes('TESLA')) {
    return 'CCS';
  } else if (type.includes('CHADEMO')) {
    return 'CHADEMO';
  } else if (type.includes('GB/T')) {
    return 'CCS'; // Map GB/T to CCS for now
  } else {
    return 'OTHER';
  }
}

// Helper function to map TeamEnergy status to standard format
function mapTeamEnergyStatus(status: string): 'AVAILABLE' | 'BUSY' | 'UNKNOWN' | 'OFFLINE' {
  const statusNum = parseInt(status);
  
  if (statusNum === 1) {
    return 'AVAILABLE';
  } else if (statusNum === 6) {
    return 'BUSY';
  } else if (statusNum === 0) {
    return 'OFFLINE';
  } else {
    return 'UNKNOWN';
  }
}

// Function to fetch chargers from backend
export async function fetchAllChargers(): Promise<ChargingStation[]> {
  console.log('Fetching chargers from backend...');
  
  try {
    // Fetch data from backend API
    const response = await fetch(`${API_BASE_URL}/api/data`);
    if (!response.ok) {
      console.error(`Backend fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend data response:', data);
    
    // Check if teamEnergy data exists and has the chargers array
    const teamEnergyData = data.teamEnergy?.chargers || data.teamEnergy || [];
    console.log(`Retrieved ${teamEnergyData.length || 0} Team Energy chargers from backend`);
    console.log('Sample TeamEnergy data:', teamEnergyData[0]);
    
    // Convert TeamEnergy stations to standard format
    const teamEnergyChargers: ChargingStation[] = teamEnergyData.map((station: TeamEnergyStation) => {
      console.log('Processing station:', station.name);
      
      // Collect all connectors from all charge point infos
      const allPorts = station.chargePointInfos.flatMap(info => 
        info.connectors.map(connector => ({
          id: connector.connectorId,
          type: mapTeamEnergyPortType(connector.connectorType),
          power: connector.power,
          status: mapTeamEnergyStatus(connector.status)
        }))
      );

      return {
        id: station.chargePointId,
        name: station.name,
        brand: 'TEAM_ENERGY' as const,
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address,
        ports: allPorts
      };
    });
    
    console.log(`Converted ${teamEnergyChargers.length} Team Energy stations`);
    console.log('Sample converted station:', teamEnergyChargers[0]);
    
    // For now, skip EvanCharge data processing since we're focusing on TeamEnergy
    const evanChargeChargers: ChargingStation[] = [];
    
    // Combine both sources
    const allChargers = [...teamEnergyChargers, ...evanChargeChargers];
    console.log(`Total: ${allChargers.length} chargers loaded from backend`);
    
    return allChargers;
  } catch (error) {
    console.error('Error fetching chargers from backend:', error);
    console.warn('Using mock data as fallback');
    return mockChargers;
  }
}

// Function to trigger a data refresh from the backend
export async function refreshData(): Promise<boolean> {
  console.log('Requesting backend to refresh data from APIs...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/refresh`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Data refresh failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Data refresh result:', result);
    
    return result.success;
  } catch (error) {
    console.error('Error refreshing data:', error);
    return false;
  }
}
