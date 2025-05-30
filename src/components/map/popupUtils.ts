
import { ChargingStation } from '@/types/chargers';
import { getStatusColor, getStatusIcon } from './markerUtils';

export const createPopupContent = (station: ChargingStation) => {
  // Group ports by chargePointId for Team Energy stations
  const portGroups: { [key: string]: any[] } = {};
  
  if (station.brand === 'TEAM_ENERGY') {
    // For Team Energy, group by chargePointId (stored in port metadata)
    station.ports.forEach(port => {
      const groupId = port.chargePointId || 'default';
      if (!portGroups[groupId]) {
        portGroups[groupId] = [];
      }
      portGroups[groupId].push(port);
    });
  } else {
    // For other brands, use a single group
    portGroups['default'] = station.ports;
  }

  // Create enhanced popup content with grouped connectors
  let connectorsHtml = '';
  const groupKeys = Object.keys(portGroups);
  
  groupKeys.forEach((groupId, groupIndex) => {
    const ports = portGroups[groupId];
    
    // Add group header for Team Energy with multiple groups
    if (station.brand === 'TEAM_ENERGY' && groupKeys.length > 1) {
      connectorsHtml += `
        <div class="font-medium text-sm text-blue-700 mb-2 mt-3">
          Charge Point ${groupIndex + 1}
        </div>
      `;
    }
    
    // Add ports for this group
    ports.forEach(port => {
      connectorsHtml += `
        <div class="border rounded-lg p-3 bg-gray-50 mb-2">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-gray-800">${port.type}</span>
            <span class="${getStatusColor(port.status)} font-bold">
              ${getStatusIcon(port.status)} ${port.statusDescription || port.status}
            </span>
          </div>
          <div class="text-sm text-gray-600">
            <div class="flex justify-between mb-1">
              <span>Power:</span>
              <span class="font-medium">${port.power} kW</span>
            </div>
            ${port.price ? `
              <div class="flex justify-between">
                <span>Price:</span>
                <span class="font-medium">${port.price} AMD/kWh</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    // Add divider between groups (except for the last group)
    if (groupIndex < groupKeys.length - 1) {
      connectorsHtml += `
        <div class="border-t border-gray-300 my-3"></div>
      `;
    }
  });

  return `
    <div class="max-w-sm">
      <div class="p-4 pb-2">
        <h3 class="font-bold text-lg mb-2 text-blue-800">${station.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${station.address}</p>
      </div>
      
      <div class="max-h-64 overflow-y-auto px-4 custom-scrollbar">
        <div class="mb-3">
          <h4 class="font-semibold mb-2 text-gray-800">Available Connectors:</h4>
          <div class="space-y-2">
            ${connectorsHtml}
          </div>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 mt-3 pt-2 border-t px-4 pb-4">
        <div>Brand: ${station.brand === 'TEAM_ENERGY' ? 'Team Energy' : 'Evan Charge'}</div>
        <div>Station ID: ${station.id}</div>
      </div>
    </div>
  `;
};
