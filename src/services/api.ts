
import { ChargingStation } from '@/types/chargers';
import { authenticateTeamEnergy, fetchTeamEnergyChargers } from './apis/teamEnergy';
import { authenticateEvanCharge, fetchEvanChargeChargers } from './apis/evanCharge';
import { mockChargers } from './apis/mockData';
import { useProxyMode, setProxyMode } from './apis/proxy';

export async function fetchAllChargers(): Promise<ChargingStation[]> {
  console.log('Starting to fetch all chargers...');
  let allChargers: ChargingStation[] = [];
  let useMockData = false;
  
  // Use the proxy mode setting for debugging
  const proxyEnabled = useProxyMode();
  console.log(`Proxy mode is ${proxyEnabled ? 'enabled' : 'disabled'}`);
  
  // Team Energy API Call
  try {
    const teamEnergyToken = await authenticateTeamEnergy();
    if (teamEnergyToken.success && teamEnergyToken.data) {
      const teamEnergyResult = await fetchTeamEnergyChargers(teamEnergyToken.data);
      if (teamEnergyResult.success && teamEnergyResult.data) {
        console.log(`Successfully retrieved ${teamEnergyResult.data.length} Team Energy chargers`);
        allChargers = [...allChargers, ...teamEnergyResult.data];
      } else {
        console.error('Failed to fetch Team Energy chargers:', teamEnergyResult.error);
        useMockData = true;
      }
    } else {
      console.error('Team Energy authentication failed:', teamEnergyToken.error);
      useMockData = true;
    }
  } catch (error) {
    console.error('Team Energy API call failed with exception:', error);
    useMockData = true;
  }

  // Evan Charge API Call
  try {
    const evanChargeToken = await authenticateEvanCharge();
    if (evanChargeToken.success && evanChargeToken.data) {
      const evanChargeResult = await fetchEvanChargeChargers(evanChargeToken.data);
      if (evanChargeResult.success && evanChargeResult.data) {
        console.log(`Successfully retrieved ${evanChargeResult.data.length} Evan Charge chargers`);
        allChargers = [...allChargers, ...evanChargeResult.data];
      } else {
        console.error('Failed to fetch Evan Charge chargers:', evanChargeResult.error);
        if (allChargers.length === 0) {
          useMockData = true;
        }
      }
    } else {
      console.error('Evan Charge authentication failed:', evanChargeToken.error);
      if (allChargers.length === 0) {
        useMockData = true;
      }
    }
  } catch (error) {
    console.error('Evan Charge API call failed with exception:', error);
    if (allChargers.length === 0) {
      useMockData = true;
    }
  }

  // Use mock data if both API calls failed
  if (useMockData) {
    console.warn('Using mock data due to API failures');
    return mockChargers;
  }

  console.log(`Returning ${allChargers.length} total chargers`);
  return allChargers;
}

// Function to toggle proxy mode for debugging
export function toggleProxyMode(): boolean {
  const newMode = !useProxyMode();
  setProxyMode(newMode);
  return newMode;
}
