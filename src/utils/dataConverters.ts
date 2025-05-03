
import { ChargingStation, PortType, ChargingStatus } from '@/types/chargers';
import { RawTeamEnergyStation, RawEvanChargeStation } from '@/services/apis/types';

// Convert Team Energy port type to standard format
function mapTeamEnergyPortType(portType: string): PortType {
  switch (portType.toUpperCase()) {
    case 'TYPE1':
    case 'TYPE 1':
      return 'TYPE_1';
    case 'TYPE2':
    case 'TYPE 2':
      return 'TYPE_2';
    case 'CCS':
    case 'CCS1':
    case 'CCS2':
      return 'CCS';
    case 'CHADEMO':
      return 'CHADEMO';
    default:
      console.log(`Unknown Team Energy port type: ${portType}, mapping to OTHER`);
      return 'OTHER';
  }
}

// Convert Team Energy status to standard format
function mapTeamEnergyStatus(status: string): ChargingStatus {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
    case 'FREE':
    case 'IDLE':
      return 'AVAILABLE';
    case 'BUSY':
    case 'CHARGING':
    case 'IN_USE':
    case 'OCCUPIED':
      return 'BUSY';
    case 'OFFLINE':
    case 'OUT_OF_ORDER':
    case 'UNAVAILABLE':
      return 'OFFLINE';
    default:
      console.log(`Unknown Team Energy status: ${status}, mapping to UNKNOWN`);
      return 'UNKNOWN';
  }
}

// Convert Evan Charge port type to standard format
function mapEvanChargePortType(portType: string): PortType {
  switch (portType.toUpperCase()) {
    case 'TYPE1':
    case 'TYPE 1':
    case 'TYPE1_SOCKET':
      return 'TYPE_1';
    case 'TYPE2':
    case 'TYPE 2':
    case 'TYPE2_SOCKET':
      return 'TYPE_2';
    case 'CCS':
    case 'CCS1':
    case 'CCS2':
      return 'CCS';
    case 'CHADEMO':
      return 'CHADEMO';
    default:
      console.log(`Unknown Evan Charge port type: ${portType}, mapping to OTHER`);
      return 'OTHER';
  }
}

// Convert Evan Charge status to standard format
function mapEvanChargeStatus(status: string): ChargingStatus {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
    case 'FREE':
    case 'IDLE':
      return 'AVAILABLE';
    case 'BUSY':
    case 'CHARGING':
    case 'IN_USE':
    case 'OCCUPIED':
      return 'BUSY';
    case 'OFFLINE':
    case 'OUT_OF_ORDER':
    case 'UNAVAILABLE':
      return 'OFFLINE';
    default:
      console.log(`Unknown Evan Charge status: ${status}, mapping to UNKNOWN`);
      return 'UNKNOWN';
  }
}

export function convertTeamEnergyToStandardFormat(station: RawTeamEnergyStation): ChargingStation {
  return {
    id: station.id,
    name: station.name,
    brand: 'TEAM_ENERGY',
    latitude: station.latitude,
    longitude: station.longitude,
    address: station.address,
    ports: station.ports.map(port => ({
      id: port.id,
      type: mapTeamEnergyPortType(port.type),
      power: port.power,
      status: mapTeamEnergyStatus(port.status)
    }))
  };
}

export function convertEvanChargeToStandardFormat(station: RawEvanChargeStation): ChargingStation {
  return {
    id: station.id,
    name: station.title,
    brand: 'EVAN_CHARGE',
    latitude: station.latitude,
    longitude: station.longitude,
    address: station.address,
    ports: station.connectors.map(connector => ({
      id: connector.id,
      type: mapEvanChargePortType(connector.connectorType),
      power: connector.powerKw,
      status: mapEvanChargeStatus(connector.status)
    }))
  };
}
