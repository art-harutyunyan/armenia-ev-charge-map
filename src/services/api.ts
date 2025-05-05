
import { ChargingStation } from '@/types/chargers';
import { mockChargers } from './apis/mockData';

// Function to fetch chargers from local JSON files
export async function fetchAllChargers(): Promise<ChargingStation[]> {
  console.log('Fetching chargers from local JSON files...');
  
  try {
    // Fetch Team Energy chargers
    const teamEnergyResponse = await fetch('/data/teamEnergy.json');
    if (!teamEnergyResponse.ok) {
      throw new Error(`Failed to fetch Team Energy data: ${teamEnergyResponse.status}`);
    }
    
    const teamEnergyData = await teamEnergyResponse.json();
    console.log(`Retrieved ${teamEnergyData.chargers?.length || 0} Team Energy chargers from JSON`);
    
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
    
    // Fetch Evan Charge chargers
    const evanChargeResponse = await fetch('/data/evanCharge.json');
    if (!evanChargeResponse.ok) {
      throw new Error(`Failed to fetch Evan Charge data: ${evanChargeResponse.status}`);
    }
    
    const evanChargeData = await evanChargeResponse.json();
    console.log(`Retrieved ${evanChargeData.data?.length || 0} Evan Charge chargers from JSON`);
    
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
    console.log(`Total: ${allChargers.length} chargers loaded from local JSON files`);
    
    return allChargers;
  } catch (error) {
    console.error('Error fetching chargers from local JSON files:', error);
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

export function refreshData(): Promise<boolean> {
  return new Promise((resolve) => {
    // This is a client-side function that simply refreshes the page
    // The actual data refresh happens on the server side or via the debug panel
    window.location.reload();
    resolve(true);
  });
}
