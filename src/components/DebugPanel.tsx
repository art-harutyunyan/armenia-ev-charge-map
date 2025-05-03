
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toggleProxyMode, useProxyMode } from '@/services/apis/proxy';
import { useToast } from '@/hooks/use-toast';

const DebugPanel: React.FC = () => {
  const [isProxyEnabled, setIsProxyEnabled] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsProxyEnabled(useProxyMode());
  }, []);
  
  const handleProxyToggle = () => {
    const newMode = toggleProxyMode();
    setIsProxyEnabled(newMode);
    
    toast({
      title: `Proxy Mode ${newMode ? 'Enabled' : 'Disabled'}`,
      description: newMode 
        ? "API requests will now use a CORS proxy. Refresh the page to load new data." 
        : "API requests will now be direct. Refresh the page to load new data.",
      variant: newMode ? "default" : "destructive"
    });
  };
  
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold mb-2">Debug Options</h3>
      <div className="flex items-center">
        <Button 
          onClick={handleProxyToggle}
          variant={isProxyEnabled ? "default" : "outline"}
          className="mr-2"
        >
          {isProxyEnabled ? "Disable Proxy" : "Enable Proxy"}
        </Button>
        <span className="text-sm text-gray-600">
          {isProxyEnabled 
            ? "Using CORS proxy for API requests" 
            : "Using direct API requests (may be blocked by CORS)"}
        </span>
      </div>
    </div>
  );
};

export default DebugPanel;
