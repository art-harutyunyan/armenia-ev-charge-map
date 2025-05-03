
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChargingStation, ChargingStationFilters, PortType, ChargingStatus } from '../types/chargers';
import { useToast } from '@/hooks/use-toast';

interface ChargingMapProps {
  stations: ChargingStation[];
  filters: ChargingStationFilters;
}

const ChargingMap: React.FC<ChargingMapProps> = ({ stations, filters }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const { toast } = useToast();
  const [mapboxToken, setMapboxToken] = useState<string>("");

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

  // Handle Mapbox token input
  const handleTokenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get('mapboxToken') as string;
    
    if (token) {
      setMapboxToken(token);
      localStorage.setItem('mapboxToken', token);
      toast({
        title: "Mapbox token saved",
        description: "Your Mapbox token has been saved and will be used to display the map."
      });
    }
  };

  useEffect(() => {
    // Check for saved token in local storage
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;
    
    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
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

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Add markers for stations
  useEffect(() => {
    if (!map.current) return;

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
  }, [filteredStations, map.current]);

  if (!mapboxToken) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-4">Mapbox Token Required</h2>
        <p className="mb-4 text-center">
          Please provide your Mapbox token to display the charging stations map.
          <br />
          You can get one for free at <a href="https://www.mapbox.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">mapbox.com</a>
        </p>
        <form onSubmit={handleTokenSubmit} className="w-full max-w-md">
          <div className="flex flex-col gap-4">
            <input 
              type="text"
              name="mapboxToken"
              placeholder="Enter your Mapbox token"
              className="px-4 py-2 border rounded-md"
              required
            />
            <button 
              type="submit" 
              className="px-4 py-2 bg-brand-blue text-white rounded-md"
            >
              Save Token
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="h-[70vh] md:h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default ChargingMap;
