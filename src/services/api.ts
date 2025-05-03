import { ChargingStation, PortType, ChargingStatus } from '../types/chargers';

interface TeamEnergyAuth {
  token: string;
  expiresAt: number;
}

interface EvanChargeAuth {
  token: string;
  expiresAt: number;
}

interface AuthTokens {
  teamEnergy: TeamEnergyAuth | null;
  evanCharge: EvanChargeAuth | null;
}

// Keep auth tokens in memory
let authTokens: AuthTokens = {
  teamEnergy: null,
  evanCharge: null
};

// Helper to check if token is expired
const isTokenExpired = (expiresAt: number): boolean => {
  return Date.now() >= expiresAt;
};

// Team Energy Authentication
const authenticateTeamEnergy = async (): Promise<string> => {
  if (authTokens.teamEnergy && !isTokenExpired(authTokens.teamEnergy.expiresAt)) {
    return authTokens.teamEnergy.token;
  }

  try {
    const response = await fetch('https://api.teamenergy.am/UserManagement/Login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        guestMode: false,
        password: "P0ker123$5!",
        phoneNumber: "+37493709944"
      })
    });

    if (!response.ok) {
      throw new Error(`Team Energy authentication failed: ${response.status}`);
    }

    const data = await response.json();
    const token = data.token || data.accessToken;
    
    // Set expiration to 23 hours from now to be safe
    const expiresAt = Date.now() + 23 * 60 * 60 * 1000;
    
    authTokens.teamEnergy = {
      token,
      expiresAt
    };

    return token;
  } catch (error) {
    console.error('Team Energy authentication error:', error);
    throw error;
  }
};

// Evan Charge Authentication
const authenticateEvanCharge = async (): Promise<string> => {
  if (authTokens.evanCharge && !isTokenExpired(authTokens.evanCharge.expiresAt)) {
    return authTokens.evanCharge.token;
  }

  try {
    const response = await fetch('https://evcharge-api-prod.e-evan.com/api/users/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Add required authentication details here - these would need to be provided
        email: "user@example.com", // These are placeholder credentials
        password: "password123"     // You'll need to update with real credentials
      })
    });

    if (!response.ok) {
      throw new Error(`Evan Charge authentication failed: ${response.status}`);
    }

    const data = await response.json();
    const token = data.token || data.accessToken;
    
    // Set expiration to 23 hours from now to be safe
    const expiresAt = Date.now() + 23 * 60 * 60 * 1000;
    
    authTokens.evanCharge = {
      token,
      expiresAt
    };

    return token;
  } catch (error) {
    console.error('Evan Charge authentication error:', error);
    throw error;
  }
};

// Fetch Team Energy Chargers
const fetchTeamEnergyChargers = async (): Promise<any> => {
  try {
    const token = await authenticateTeamEnergy();
    
    const response = await fetch('https://api.teamenergy.am/ChargePoint/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        noLatest: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Team Energy chargers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Team Energy chargers:', error);
    throw error;
  }
};

// Fetch Evan Charge Chargers
const fetchEvanChargeChargers = async (): Promise<any> => {
  try {
    const token = await authenticateEvanCharge();
    
    const response = await fetch('https://evcharge-api-prod.e-evan.com/api/stations/stations?_limit=1000&_offset=0&includePricing=is_equal:%22true%22', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Evan Charge chargers: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Evan Charge chargers:', error);
    throw error;
  }
};

// Map Team Energy port type to unified port type
const mapTeamEnergyPortType = (portType: string): PortType => {
  const typeMap: Record<string, PortType> = {
    // Add mapping based on actual Team Energy API response
    'Type1': 'TYPE_1',
    'Type2': 'TYPE_2',
    'CCS': 'CCS',
    'CHAdeMO': 'CHADEMO',
    // Add more mappings as needed
  };

  return typeMap[portType] || 'OTHER';
};

// Map Evan Charge port type to unified port type
const mapEvanChargePortType = (portType: string): PortType => {
  const typeMap: Record<string, PortType> = {
    // Add mapping based on actual Evan Charge API response
    'Type1': 'TYPE_1',
    'Type2': 'TYPE_2',
    'CCS': 'CCS',
    'CHAdeMO': 'CHADEMO',
    // Add more mappings as needed
  };

  return typeMap[portType] || 'OTHER';
};

// Map Team Energy status to unified status
const mapTeamEnergyStatus = (status: string): ChargingStatus => {
  const statusMap: Record<string, ChargingStatus> = {
    // Add mapping based on actual Team Energy API response
    'Available': 'AVAILABLE',
    'Busy': 'BUSY',
    'Offline': 'OFFLINE',
    // Add more mappings as needed
  };

  return statusMap[status] || 'UNKNOWN';
};

// Map Evan Charge status to unified status
const mapEvanChargeStatus = (status: string): ChargingStatus => {
  const statusMap: Record<string, ChargingStatus> = {
    // Add mapping based on actual Evan Charge API response
    'AVAILABLE': 'AVAILABLE',
    'BUSY': 'BUSY',
    'OFFLINE': 'OFFLINE',
    // Add more mappings as needed
  };

  return statusMap[status] || 'UNKNOWN';
};

// Convert Team Energy API response to unified format
export const convertTeamEnergyData = (data: any): ChargingStation[] => {
  // This is a placeholder implementation - update based on actual API response structure
  try {
    return data.map((station: any) => {
      const ports = station.chargePoints?.map((point: any) => ({
        id: point.id,
        type: mapTeamEnergyPortType(point.connectorType),
        power: parseFloat(point.power) || 0,
        status: mapTeamEnergyStatus(point.status)
      })) || [];

      return {
        id: station.id,
        name: station.name || 'Team Energy Station',
        brand: 'TEAM_ENERGY',
        latitude: station.lat,
        longitude: station.lng,
        address: station.address || 'No address provided',
        ports
      };
    });
  } catch (error) {
    console.error('Error converting Team Energy data:', error);
    return [];
  }
};

// Convert Evan Charge API response to unified format
export const convertEvanChargeData = (data: any): ChargingStation[] => {
  // This is a placeholder implementation - update based on actual API response structure
  try {
    return data.map((station: any) => {
      const ports = station.connectors?.map((connector: any) => ({
        id: connector.id,
        type: mapEvanChargePortType(connector.type),
        power: parseFloat(connector.power) || 0,
        status: mapEvanChargeStatus(connector.status)
      })) || [];

      return {
        id: station.id,
        name: station.name || 'Evan Charge Station',
        brand: 'EVAN_CHARGE',
        latitude: station.latitude,
        longitude: station.longitude,
        address: station.address || 'No address provided',
        ports
      };
    });
  } catch (error) {
    console.error('Error converting Evan Charge data:', error);
    return [];
  }
};

// Fetch all chargers and unify the data
export const fetchAllChargers = async (): Promise<ChargingStation[]> => {
  try {
    const [teamEnergyData, evanChargeData] = await Promise.all([
      fetchTeamEnergyChargers(),
      fetchEvanChargeChargers()
    ]);

    const teamEnergyStations = convertTeamEnergyData(teamEnergyData);
    const evanChargeStations = convertEvanChargeData(evanChargeData);

    return [...teamEnergyStations, ...evanChargeStations];
  } catch (error) {
    console.error('Error fetching all chargers:', error);
    return [];
  }
};

// Mock function to fetch data for development
export const fetchMockChargers = (): ChargingStation[] => {
  return [
    {
      id: 'te-001',
      name: 'Team Energy Station 1',
      brand: 'TEAM_ENERGY',
      latitude: 40.1872,
      longitude: 44.5152,
      address: 'Yerevan, Armenia',
      ports: [
        {
          id: 'port-001',
          type: 'CCS',
          power: 50,
          status: 'AVAILABLE'
        },
        {
          id: 'port-002',
          type: 'TYPE_2',
          power: 22,
          status: 'BUSY'
        }
      ]
    },
    {
      id: 'te-002',
      name: 'Team Energy Station 2',
      brand: 'TEAM_ENERGY',
      latitude: 40.1950,
      longitude: 44.4900,
      address: 'Yerevan, Armenia',
      ports: [
        {
          id: 'port-003',
          type: 'CHADEMO',
          power: 50,
          status: 'AVAILABLE'
        }
      ]
    },
    {
      id: 'ec-001',
      name: 'Evan Charge Station 1',
      brand: 'EVAN_CHARGE',
      latitude: 40.1800,
      longitude: 44.5100,
      address: 'Yerevan, Armenia',
      ports: [
        {
          id: 'port-004',
          type: 'TYPE_1',
          power: 7,
          status: 'AVAILABLE'
        },
        {
          id: 'port-005',
          type: 'TYPE_2',
          power: 22,
          status: 'AVAILABLE'
        }
      ]
    },
    {
      id: 'ec-002',
      name: 'Evan Charge Station 2',
      brand: 'EVAN_CHARGE',
      latitude: 40.2000,
      longitude: 44.5200,
      address: 'Yerevan, Armenia',
      ports: [
        {
          id: 'port-006',
          type: 'CCS',
          power: 150,
          status: 'OFFLINE'
        }
      ]
    }
  ];
};
