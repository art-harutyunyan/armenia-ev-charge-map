
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChargingMap from '@/components/ChargingMap';
import FilterPanel from '@/components/FilterPanel';
import { ChargingStation, ChargingStationFilters } from '@/types/chargers';
import { fetchMockChargers, fetchAllChargers } from '@/services/api';
import { initScheduler } from '@/utils/scheduler';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<ChargingStationFilters>({
    portTypes: [],
    minPower: 0,
    maxPower: 150,
    status: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Initially use mock data for development
        // In production, uncomment the fetchAllChargers line
        const data = fetchMockChargers();
        // const data = await fetchAllChargers();
        setStations(data);
        
        if (data.length === 0) {
          toast({
            title: "No charging stations found",
            description: "No charging stations could be retrieved. Using mock data for demonstration.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Data loaded successfully",
            description: `Found ${data.length} charging stations.`
          });
        }
      } catch (error) {
        console.error('Failed to fetch charging stations:', error);
        
        // Use mock data as fallback
        const mockData = fetchMockChargers();
        setStations(mockData);
        
        toast({
          title: "Error loading data",
          description: "Failed to load charging stations. Using mock data for demonstration.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Initialize scheduler for periodic updates
    const schedulerInterval = initScheduler(
      (updatedData) => {
        setStations(updatedData);
        toast({
          title: "Data updated",
          description: "Charging station data has been refreshed."
        });
      },
      (error) => {
        toast({
          title: "Update failed",
          description: "Failed to update charging station data.",
          variant: "destructive"
        });
      }
    );

    return () => {
      clearInterval(schedulerInterval);
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pb-8">
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
          </div>
        ) : (
          <ChargingMap stations={stations} filters={filters} />
        )}
      </main>
      
      <footer className="bg-white border-t p-4">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>© 2025 Armenia EV Charge Map. All rights reserved.</p>
          <p className="mt-1">Data updates at 10:00 AM and 10:00 PM (Yerevan time)</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
