
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChargingStation, ChargingStationFilters } from '../types/chargers';
import { useToast } from '@/hooks/use-toast';
import { MAPBOX_TOKEN } from '@/config/mapbox';

interface ChargingMapProps {
  stations: ChargingStation[];
  filters: ChargingStationFilters;
}

const ChargingMap: React.FC<ChargingMapProps> = ({ stations, filters }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { toast } = useToast();
  const [mapInitialized, setMapInitialized] = useState<boolean>(false);

  // Filter stations based on selected filters
  const filteredStations = stations.filter(station => {
    // Check if any port matches the filter criteria
    return station.ports.some(port => {
      // Filter by port type - for TeamEnergy, we need to handle original types
      const typeMatch = filters.portTypes.length === 0 || 
        filters.portTypes.some(filterType => {
          if (typeof port.type === 'string') {
            // Handle TeamEnergy original types
            const portTypeUpper = port.type.toUpperCase();
            if (filterType === 'TYPE_1' && portTypeUpper.includes('TYPE 1')) return true;
            if (filterType === 'TYPE_2' && portTypeUpper.includes('TYPE 2')) return true;
            if (filterType === 'CCS' && (portTypeUpper.includes('CCS') || portTypeUpper.includes('TESLA'))) return true;
            if (filterType === 'CHADEMO' && portTypeUpper.includes('CHADEMO')) return true;
            return filterType === 'OTHER';
          }
          return port.type === filterType;
        });
      
      // Filter by power range
      const powerMatch = port.power >= filters.minPower && 
        (filters.maxPower === 0 || port.power <= filters.maxPower);
      
      // Filter by status
      const statusMatch = filters.status.length === 0 || filters.status.includes(port.status);
      
      return typeMatch && powerMatch && statusMatch;
    });
  });

  console.log('ChargingMap received stations:', stations.length);
  console.log('Filtered stations:', filteredStations.length);
  console.log('Sample station:', stations[0]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Initialize map with token from config
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [44.5152, 40.1872], // Centered on Yerevan, Armenia
        zoom: 10
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      map.current.on('load', () => {
        setMapInitialized(true);
        console.log('Mapbox map initialized');
      });

      // Clean up on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Map Error",
        description: "Failed to initialize the map. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Function to get status color
  const getStatusColor = (status: string) => {
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

  // Function to get status icon
  const getStatusIcon = (status: string) => {
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

  // Add markers for stations when map is initialized and stations are loaded
  useEffect(() => {
    if (!map.current || !mapInitialized) {
      console.log('Map not ready yet:', { mapExists: !!map.current, mapInitialized });
      return;
    }
    
    console.log(`Adding markers for ${filteredStations.length} filtered stations`);

    // Remove any existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for filtered stations
    filteredStations.forEach(station => {
      console.log('Adding marker for station:', station.name, 'at coords:', station.latitude, station.longitude);
      
      // Validate coordinates
      if (!station.latitude || !station.longitude || 
          isNaN(station.latitude) || isNaN(station.longitude)) {
        console.error('Invalid coordinates for station:', station.name, station.latitude, station.longitude);
        return;
      }
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      
      // Style based on brand
      if (station.brand === 'TEAM_ENERGY') {
        markerElement.className += ' team-energy-marker';
        markerElement.innerHTML = `
          <div class="w-12 h-12 rounded-full bg-white p-1 shadow-lg flex items-center justify-center border-2 border-blue-500">
            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">TE</div>
          </div>
        `;
      } else {
        markerElement.className += ' evan-charge-marker';
        markerElement.innerHTML = `
          <div class="w-12 h-12 rounded-full bg-white p-1 shadow-lg flex items-center justify-center border-2 border-green-500">
            <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">EC</div>
          </div>
        `;
      }

      // Create enhanced popup content with correct data
      const popupContent = `
        <div class="p-4 max-w-sm">
          <h3 class="font-bold text-lg mb-2 text-blue-800">${station.name}</h3>
          <p class="text-sm text-gray-600 mb-3">${station.address}</p>
          
          <div class="mb-3">
            <h4 class="font-semibold mb-2 text-gray-800">Available Connectors:</h4>
            <div class="space-y-2">
              ${station.ports
                .map(port => `
                  <div class="border rounded-lg p-3 bg-gray-50">
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
                `)
                .join('')
              }
            </div>
          </div>
          
          <div class="text-xs text-gray-500 mt-3 pt-2 border-t">
            <div>Brand: ${station.brand === 'TEAM_ENERGY' ? 'Team Energy' : 'Evan Charge'}</div>
            <div>Station ID: ${station.id}</div>
          </div>
        </div>
      `;

      // Create marker and popup
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            maxWidth: '400px',
            className: 'custom-popup'
          })
            .setHTML(popupContent)
        )
        .addTo(map.current!);

      markersRef.current[station.id] = marker;
      console.log('Marker added successfully for:', station.name);
    });

    // Adjust map bounds to fit all markers if there are any
    if (filteredStations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      filteredStations.forEach(station => {
        if (station.latitude && station.longitude && 
            !isNaN(station.latitude) && !isNaN(station.longitude)) {
          bounds.extend([station.longitude, station.latitude]);
        }
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  }, [filteredStations, mapInitialized]);

  return (
    <div className="h-[70vh] md:h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default ChargingMap;
