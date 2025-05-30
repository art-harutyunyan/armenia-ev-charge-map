
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ChargingStation, ChargingStationFilters } from '../types/chargers';
import { useToast } from '@/hooks/use-toast';
import { MAPBOX_TOKEN } from '@/config/mapbox';
import { useMapMarkers } from '@/hooks/useMapMarkers';

interface ChargingMapProps {
  stations: ChargingStation[];
  filters: ChargingStationFilters;
}

const ChargingMap: React.FC<ChargingMapProps> = ({ stations, filters }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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

  // Use the map markers hook
  const { activeMarkerId, closeAllPopups } = useMapMarkers(map, mapInitialized, filteredStations);

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

  return (
    <div className="h-[70vh] md:h-[80vh] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default ChargingMap;
