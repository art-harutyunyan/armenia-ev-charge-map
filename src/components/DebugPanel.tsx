
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { refreshData } from '@/services/api';

const DebugPanel: React.FC = () => {
  const { toast } = useToast();
  
  const handleRefresh = async () => {
    toast({
      title: "Refreshing Data",
      description: "Reloading the page to get the latest data from JSON files.",
    });
    
    await refreshData();
  };
  
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-2">Debug Options</h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Button 
          onClick={handleRefresh}
          variant="outline"
        >
          Refresh Data
        </Button>
        <span className="text-sm text-gray-600">
          Using local JSON files for charging station data. To update the JSON files, run the data processor script.
        </span>
      </div>
    </div>
  );
};

export default DebugPanel;
