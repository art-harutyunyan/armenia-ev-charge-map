
// This file provides proxy methods for handling CORS issues

// Track the current proxy mode in localStorage
const PROXY_MODE_KEY = 'evcharge_proxy_mode';

// Function to check if proxy mode is enabled
export function useProxyMode(): boolean {
  const stored = localStorage.getItem(PROXY_MODE_KEY);
  return stored ? JSON.parse(stored) : false;
}

// Function to enable or disable proxy mode
export function setProxyMode(enabled: boolean): void {
  localStorage.setItem(PROXY_MODE_KEY, JSON.stringify(enabled));
}

// Function to toggle proxy mode and return the new state
export function toggleProxyMode(): boolean {
  const currentMode = useProxyMode();
  const newMode = !currentMode;
  setProxyMode(newMode);
  return newMode;
}

// This proxy fetch function can be modified to handle CORS issues
export async function proxyFetch(url: string, options: RequestInit = {}): Promise<Response> {
  console.log(`[ProxyFetch] ${useProxyMode() ? 'Using proxy for' : 'Direct request to'}: ${url}`);
  
  if (useProxyMode()) {
    // Use a CORS proxy like cors-anywhere
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    console.log(`[ProxyFetch] Proxying through: ${proxyUrl}`);
    return fetch(`${proxyUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest', // Required by some CORS proxies
      }
    });
  } else {
    // Direct request (may be blocked by CORS)
    return fetch(url, options);
  }
}

// Setup proxy functionality
export const setupProxy = () => {
  console.log(`Proxy mode is ${useProxyMode() ? 'enabled' : 'disabled'}`);
};
