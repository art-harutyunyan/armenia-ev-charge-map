
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DebugPanel: React.FC = () => {
  const { toast } = useToast();
  
  const handleRefresh = () => {
    // Simply refresh the page to reload data
    window.location.reload();
    
    toast({
      title: "Refreshing Data",
      description: "The page is refreshing to load the latest data.",
    });
  };
  
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-2">Debug Options</h3>
      <div className="flex items-center">
        <Button 
          onClick={handleRefresh}
          variant="outline"
          className="mr-2"
        >
          Refresh Data
        </Button>
        <span className="text-sm text-gray-600">
          Using local JSON files for charging station data
        </span>
      </div>
    </div>
  );
};

export default DebugPanel;
