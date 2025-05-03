
import { fetchAllChargers } from '../services/api';

// Function to determine if it's time for a scheduled update
// Targets 10:00 AM and 10:00 PM Yerevan time (GMT+4)
export const shouldUpdateData = (): boolean => {
  // Get current time in Yerevan timezone (GMT+4)
  const now = new Date();
  const yerevanOffset = 4 * 60; // Yerevan is GMT+4 (4 hours = 240 minutes)
  const utcOffset = now.getTimezoneOffset(); // Returns negative for timezones ahead of UTC
  const totalOffset = yerevanOffset + utcOffset;
  
  // Adjust to Yerevan time
  const yerevanTime = new Date(now.getTime() + totalOffset * 60000);
  
  const hours = yerevanTime.getHours();
  const minutes = yerevanTime.getMinutes();
  
  // Schedule updates at 10:00 AM and 10:00 PM with a 5-minute window
  if ((hours === 10 || hours === 22) && minutes >= 0 && minutes <= 5) {
    return true;
  }
  
  return false;
};

export const checkUpdateSchedule = async (
  onUpdate: (data: any) => void,
  onError: (error: any) => void
) => {
  try {
    if (shouldUpdateData()) {
      console.log('Scheduled update triggered');
      const chargers = await fetchAllChargers();
      onUpdate(chargers);
      
      // Store last update timestamp
      localStorage.setItem('lastUpdate', Date.now().toString());
    }
  } catch (error) {
    console.error('Scheduled update failed:', error);
    onError(error);
  }
};

// Function to initialize the scheduler
export const initScheduler = (
  onUpdate: (data: any) => void,
  onError: (error: any) => void
) => {
  // Check immediately on startup
  checkUpdateSchedule(onUpdate, onError);
  
  // Then check every 5 minutes
  return setInterval(() => {
    checkUpdateSchedule(onUpdate, onError);
  }, 5 * 60 * 1000);
};
