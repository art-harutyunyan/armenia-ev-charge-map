
import { ChargingStation } from '@/types/chargers';

export interface AuthResponse {
  token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RawTeamEnergyStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  ports: {
    id: string;
    type: string;
    power: number;
    status: string;
  }[];
}

export interface RawEvanChargeStation {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  connectors: {
    id: string;
    connectorType: string;
    powerKw: number;
    status: string;
  }[];
}
