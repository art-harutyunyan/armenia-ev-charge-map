
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
      // Filter by port type
      const typeMatch = filters.portTypes.length === 0 || filters.portTypes.includes(port.type);
      
      // Filter by power range
      const powerMatch = port.power >= filters.minPower && 
        (filters.maxPower === 0 || port.power <= filters.maxPower);
      
      // Filter by status
      const statusMatch = filters.status.length === 0 || filters.status.includes(port.status);
      
      return typeMatch && powerMatch && statusMatch;
    });
  });

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

  // Add markers for stations when map is initialized and stations are loaded
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    console.log(`Adding markers for ${filteredStations.length} filtered stations`);

    // Remove any existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add markers for filtered stations
    filteredStations.forEach(station => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      
      // Style based on brand
      if (station.brand === 'TEAM_ENERGY') {
        markerElement.className += ' team-energy-marker';
        markerElement.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-team-energy flex items-center justify-center text-white font-bold">TE</div>
          </div>
        `;
      } else {
        markerElement.className += ' evan-charge-marker';
        markerElement.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-evan-charge flex items-center justify-center text-white font-bold">EC</div>
          </div>
        `;
      }

      // Create marker and popup
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-lg">${station.name}</h3>
                <p class="text-sm">${station.address}</p>
                <div class="mt-2">
                  <h4 class="font-semibold">Available Ports:</h4>
                  <ul class="list-disc pl-5">
                    ${station.ports
                      .map(port => `
                        <li>
                          ${port.type} - ${port.power} kW
                          <span class="${
                            port.status === 'AVAILABLE' ? 'text-green-600' : 
                            port.status === 'BUSY' ? 'text-red-600' : 
                            port.status === 'OFFLINE' ? 'text-gray-600' : 'text-yellow-600'
                          }">
                            (${port.status})
                          </span>
                        </li>
                      `)
                      .join('')
                    }
                  </ul>
                </div>
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current[station.id] = marker;
    });

    // Adjust map bounds to fit all markers if there are any
    if (filteredStations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      filteredStations.forEach(station => {
        bounds.extend([station.longitude, station.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [filteredStations, mapInitialized]);

  return (
    <div className="h-[70vh] md:h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default ChargingMap;
