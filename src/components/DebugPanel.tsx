
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { refreshData } from '@/services/api';
import { fetchAndProcessAllData } from '@/services/dataProcessor';

const DebugPanel: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing Data",
      description: "Fetching latest data from APIs and updating JSON files...",
    });
    
    try {
      // This would typically be done server-side, but for demo purposes we're doing it client-side
      const result = await fetchAndProcessAllData();
      
      if (result) {
        toast({
          title: "Data Refreshed",
          description: `Updated data: Team Energy - ${result.teamEnergyData.chargers.length} chargers, Evan Charge - ${result.evanChargeData.data.length} stations.`,
        });
      } else {
        toast({
          title: "Refresh Failed",
          description: "Failed to update data. Check console for details.",
          variant: "destructive"
        });
      }
      
      // Reload the page to see the updated data
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "An error occurred while refreshing data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-2">Debug Options</h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Button 
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
        <span className="text-sm text-gray-600">
          Using local JSON files for charging station data. Click to fetch fresh data from APIs.
        </span>
      </div>
    </div>
  );
};

export default DebugPanel;
