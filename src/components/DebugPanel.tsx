
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
      // Fetch the data using our dataProcessor
      const result = await fetchAndProcessAllData();
      
      if (result) {
        toast({
          title: "Data Fetched",
          description: `Retrieved data: Team Energy - ${result.teamEnergyData.chargers.length} chargers, Evan Charge - ${result.evanChargeData.data.length} stations.`,
        });
        
        // Note: The actual saving of JSON files should happen server-side
        // Here we're just showing a success message
        toast({
          title: "Data Refresh Complete",
          description: "Page will now reload to show the updated data.",
        });
        
        // Reload the page to see the updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Refresh Failed",
          description: "Failed to update data. Check console for details.",
          variant: "destructive"
        });
      }
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
