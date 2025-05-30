
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
  const popupsRef = useRef<{ [key: string]: mapboxgl.Popup }>({});
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
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

  // Function to close all popups
  const closeAllPopups = () => {
    Object.values(popupsRef.current).forEach(popup => popup.remove());
    popupsRef.current = {};
    setActiveMarkerId(null);
  };

  // Function to create marker element
  const createMarkerElement = (station: ChargingStation, isActive: boolean = false) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    
    // Style based on brand and active state
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

  // Function to create popup content
  const createPopupContent = (station: ChargingStation) => {
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

  // Function to handle marker click
  const handleMarkerClick = (station: ChargingStation) => {
    // Close all existing popups first
    closeAllPopups();
    
    // Set this marker as active
    setActiveMarkerId(station.id);
    
    // Create and show popup
    const popup = new mapboxgl.Popup({ 
      offset: [0, -50],
      maxWidth: '400px',
      className: 'custom-popup',
      closeButton: true,
      closeOnClick: false,
      anchor: 'bottom'
    })
      .setLngLat([station.longitude, station.latitude])
      .setHTML(createPopupContent(station))
      .addTo(map.current!);

    // Store popup reference
    popupsRef.current[station.id] = popup;

    // Add close handler
    popup.on('close', () => {
      delete popupsRef.current[station.id];
      setActiveMarkerId(null);
    });
  };

  // Add markers for stations when map is initialized and stations are loaded
  useEffect(() => {
    if (!map.current || !mapInitialized) {
      console.log('Map not ready yet:', { mapExists: !!map.current, mapInitialized });
      return;
    }
    
    console.log(`Adding markers for ${filteredStations.length} filtered stations`);

    // Remove any existing markers and popups
    Object.values(markersRef.current).forEach(marker => marker.remove());
    closeAllPopups();
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
      const isActive = activeMarkerId === station.id;
      const markerElement = createMarkerElement(station, isActive);

      // Add click handler to marker element
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        handleMarkerClick(station);
      });

      // Create marker with click handler
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
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

  // Update marker appearances when active marker changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    // Recreate all markers with updated appearance
    filteredStations.forEach(station => {
      const existingMarker = markersRef.current[station.id];
      if (existingMarker) {
        const isActive = activeMarkerId === station.id;
        
        // Remove old marker
        existingMarker.remove();
        
        // Create new marker with updated appearance
        const newMarkerElement = createMarkerElement(station, isActive);
        
        // Add click handler to new element
        newMarkerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          handleMarkerClick(station);
        });
        
        // Create new marker
        const newMarker = new mapboxgl.Marker(newMarkerElement)
          .setLngLat([station.longitude, station.latitude])
          .addTo(map.current!);
        
        // Update reference
        markersRef.current[station.id] = newMarker;
      }
    });
  }, [activeMarkerId, filteredStations, mapInitialized]);

  return (
    <div className="h-[70vh] md:h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default ChargingMap;
