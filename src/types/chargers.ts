
export type PortType = 
  | 'TYPE_1'
  | 'TYPE_2'
  | 'CCS'
  | 'CHADEMO'
  | 'OTHER';

export type ChargingStatus = 
  | 'AVAILABLE'
  | 'BUSY'
  | 'UNKNOWN'
  | 'OFFLINE';

export interface ChargingPort {
  id: string;
  type: PortType;
  power: number; // kW
  status: ChargingStatus;
}

export interface ChargingStation {
  id: string;
  name: string;
  brand: 'TEAM_ENERGY' | 'EVAN_CHARGE';
  latitude: number;
  longitude: number;
  address: string;
  ports: ChargingPort[];
}

export interface ChargingStationFilters {
  portTypes: PortType[];
  minPower: number;
  maxPower: number;
  status: ChargingStatus[];
}

// New TeamEnergy specific types
export interface TeamEnergyConnector {
  connectorId: string;
  key: string;
  connectorType: string;
  connectorTypeGroup: string;
  power: number;
  statusDescription: string;
  status: string;
  isPrepairing: boolean;
  price: number;
  stateOfBattery: number;
}

export interface TeamEnergyChargePointInfo {
  chargePointId: string;
  isSeperated: boolean;
  stationNumber: string;
  connectors: TeamEnergyConnector[];
}

export interface TeamEnergyStation {
  chargePointId: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  chargePointInfos: TeamEnergyChargePointInfo[];
}
