
import { ChargingStation } from '@/types/chargers';

// Mock data for fallback
export const mockChargers: ChargingStation[] = [
  {
    id: "te-001",
    name: "Team Energy - Yerevan Central",
    brand: "TEAM_ENERGY",
    latitude: 40.183,
    longitude: 44.515,
    address: "1 Northern Ave, Yerevan, Armenia",
    ports: [
      {
        id: "port-001",
        type: "TYPE_2",
        power: 22,
        status: "AVAILABLE"
      },
      {
        id: "port-002",
        type: "CCS",
        power: 50,
        status: "BUSY"
      }
    ]
  },
  {
    id: "te-002",
    name: "Team Energy - Cascade",
    brand: "TEAM_ENERGY",
    latitude: 40.188,
    longitude: 44.518,
    address: "10 Tamanyan St, Yerevan, Armenia",
    ports: [
      {
        id: "port-003",
        type: "TYPE_2",
        power: 11,
        status: "OFFLINE"
      }
    ]
  },
  {
    id: "ec-001",
    name: "Evan Charge - Republic Square",
    brand: "EVAN_CHARGE",
    latitude: 40.179,
    longitude: 44.510,
    address: "2 Republic Square, Yerevan, Armenia",
    ports: [
      {
        id: "port-004",
        type: "CHADEMO",
        power: 50,
        status: "AVAILABLE"
      },
      {
        id: "port-005",
        type: "CCS",
        power: 150,
        status: "AVAILABLE"
      }
    ]
  },
  {
    id: "ec-002",
    name: "Evan Charge - Dalma Garden",
    brand: "EVAN_CHARGE",
    latitude: 40.177,
    longitude: 44.485,
    address: "Tsitsernakaberd Highway, Yerevan, Armenia",
    ports: [
      {
        id: "port-006",
        type: "TYPE_1",
        power: 7,
        status: "BUSY"
      },
      {
        id: "port-007",
        type: "TYPE_2",
        power: 22,
        status: "AVAILABLE"
      }
    ]
  }
];
