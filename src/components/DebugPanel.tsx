
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { refreshData } from '@/services/api';

const DebugPanel: React.FC = () => {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: "Refreshing Data",
      description: "Requesting backend to fetch latest data from APIs...",
    });
    
    try {
      // Trigger a refresh on the backend
      const success = await refreshData();
      
      if (success) {
        toast({
          title: "Data Refresh Complete",
          description: "Backend has successfully updated JSON data files. Reloading page to show the updates.",
        });
        
        // Reload the page to see the updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Refresh Failed",
          description: "Failed to update data. Check server logs for details.",
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
          Click to fetch fresh data from APIs via the backend server.
        </span>
      </div>
    </div>
  );
};

export default DebugPanel;
