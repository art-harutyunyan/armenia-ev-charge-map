
import { ChargingStation } from '@/types/chargers';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return 'text-green-600';
    case 'BUSY':
      return 'text-red-600';
    case 'OFFLINE':
      return 'text-gray-600';
    default:
      return 'text-yellow-600';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return '✅';
    case 'BUSY':
      return '🔴';
    case 'OFFLINE':
      return '⚫';
    default:
      return '🟡';
  }
};

export const createMarkerElement = (station: ChargingStation, isActive: boolean = false) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  
  if (station.brand === 'TEAM_ENERGY') {
    markerElement.className += ' team-energy-marker';
    const borderColor = isActive ? 'border-orange-500 border-4' : 'border-blue-500 border-2';
    const bgColor = isActive ? 'bg-orange-600' : 'bg-blue-600';
    const shadowClass = isActive ? 'shadow-xl' : 'shadow-lg';
    markerElement.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-white p-1 ${shadowClass} flex items-center justify-center ${borderColor} transition-all duration-200">
        <div class="w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm">TE</div>
      </div>
    `;
  } else {
    markerElement.className += ' evan-charge-marker';
    const borderColor = isActive ? 'border-orange-500 border-4' : 'border-green-500 border-2';
    const bgColor = isActive ? 'bg-orange-600' : 'bg-green-600';
    const shadowClass = isActive ? 'shadow-xl' : 'shadow-lg';
    markerElement.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-white p-1 ${shadowClass} flex items-center justify-center ${borderColor} transition-all duration-200">
        <div class="w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm">EC</div>
      </div>
    `;
  }

  return markerElement;
};
