
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChargingStationFilters, PortType, ChargingStatus } from '../types/chargers';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  filters: ChargingStationFilters;
  onFiltersChange: (filters: ChargingStationFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const portTypeOptions: { value: PortType; label: string }[] = [
    { value: 'TYPE_1', label: 'Type 1' },
    { value: 'TYPE_2', label: 'Type 2' },
    { value: 'CCS', label: 'CCS' },
    { value: 'CHADEMO', label: 'CHAdeMO' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statusOptions: { value: ChargingStatus; label: string }[] = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'BUSY', label: 'Busy' },
    { value: 'OFFLINE', label: 'Offline' },
    { value: 'UNKNOWN', label: 'Unknown' }
  ];

  const handlePortTypeChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, portTypes: [] });
    } else {
      onFiltersChange({ 
        ...filters, 
        portTypes: [value as PortType] 
      });
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({ ...filters, status: [] });
    } else {
      onFiltersChange({ 
        ...filters, 
        status: [value as ChargingStatus] 
      });
    }
  };

  const handlePowerChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPower: values[0],
      maxPower: values[1]
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Port Type</label>
          <Select 
            onValueChange={handlePortTypeChange}
            value={filters.portTypes.length === 1 ? filters.portTypes[0] : "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Port Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Port Types</SelectItem>
                {portTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select 
            onValueChange={handleStatusChange}
            value={filters.status.length === 1 ? filters.status[0] : "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Any Status</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Power (kW)</label>
            <span className="text-sm">
              {filters.minPower} - {filters.maxPower > 0 ? filters.maxPower : 'Max'} kW
            </span>
          </div>
          <Slider 
            defaultValue={[0, 150]} 
            min={0} 
            max={150} 
            step={1}
            onValueChange={handlePowerChange}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
