
import { ChargingStation } from '@/types/chargers';
import { mockChargers } from './apis/mockData';

// API base URL - change this to your production URL when deploying
const API_BASE_URL = 'http://localhost:3001';

// Function to fetch chargers from local JSON files
export async function fetchAllChargers(): Promise<ChargingStation[]> {
  console.log('Fetching chargers from backend JSON files...');
  
  try {
    // Fetch data from backend API
    const response = await fetch(`${API_BASE_URL}/api/data`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend data response:', data);
    
    const teamEnergyData = data.teamEnergy;
    console.log(`Retrieved ${teamEnergyData.chargers?.length || 0} Team Energy chargers from backend`);
    
    const teamEnergyChargers = teamEnergyData.chargers.map((station: any) => ({
      id: station.id,
      name: station.name,
      brand: 'TEAM_ENERGY',
      latitude: station.latitude,
      longitude: station.longitude,
      address: station.address,
      ports: station.ports.map((port: any) => ({
        id: port.id,
        type: mapPortType(port.type),
        power: port.power,
        status: mapStatus(port.status)
      }))
    }));
    
    const evanChargeData = data.evanCharge;
    console.log(`Retrieved ${evanChargeData.data?.length || 0} Evan Charge chargers from backend`);
    
    const evanChargeChargers = evanChargeData.data.map((station: any) => ({
      id: station.id,
      name: station.title,
      brand: 'EVAN_CHARGE',
      latitude: station.latitude,
      longitude: station.longitude,
      address: station.address,
      ports: station.connectors.map((connector: any) => ({
        id: connector.id,
        type: mapPortType(connector.connectorType),
        power: connector.powerKw,
        status: mapStatus(connector.status)
      }))
    }));
    
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

// Helper function to map port types to standard format
function mapPortType(portType: string): 'TYPE_1' | 'TYPE_2' | 'CCS' | 'CHADEMO' | 'OTHER' {
  const type = String(portType).toUpperCase();
  
  if (type.includes('TYPE1') || type.includes('TYPE 1')) {
    return 'TYPE_1';
  } else if (type.includes('TYPE2') || type.includes('TYPE 2')) {
    return 'TYPE_2';
  } else if (type.includes('CCS')) {
    return 'CCS';
  } else if (type.includes('CHADEMO')) {
    return 'CHADEMO';
  } else {
    return 'OTHER';
  }
}

// Helper function to map status to standard format
function mapStatus(status: string): 'AVAILABLE' | 'BUSY' | 'UNKNOWN' | 'OFFLINE' {
  const statusUpper = String(status).toUpperCase();
  
  if (statusUpper.includes('AVAILABLE') || statusUpper.includes('FREE') || statusUpper.includes('IDLE')) {
    return 'AVAILABLE';
  } else if (statusUpper.includes('BUSY') || statusUpper.includes('CHARGING') || statusUpper.includes('IN_USE')) {
    return 'BUSY';
  } else if (statusUpper.includes('OFFLINE') || statusUpper.includes('OUT_OF_ORDER')) {
    return 'OFFLINE';
  } else {
    return 'UNKNOWN';
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
