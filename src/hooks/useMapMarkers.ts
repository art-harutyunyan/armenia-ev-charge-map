
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ChargingStation } from "@/types/chargers";
import { createMarkerElement } from "@/components/map/markerUtils";
import { createPopupContent } from "@/components/map/popupUtils";

export const useMapMarkers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  mapInitialized: boolean,
  filteredStations: ChargingStation[]
) => {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const popupsRef = useRef<{ [key: string]: mapboxgl.Popup }>({});
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const closeAllPopups = () => {
    console.log("Closing all popups");
    Object.values(popupsRef.current).forEach((popup) => popup.remove());
    popupsRef.current = {};
    setActiveMarkerId(null);
  };

  const handleMarkerClick = (station: ChargingStation) => {
    console.log("=== MARKER CLICK HANDLER TRIGGERED ===");
    console.log("Station:", station.name);
    console.log("Map available:", !!map.current);
    console.log("Map initialized:", mapInitialized);

    if (!map.current) {
      console.error("Map not available when trying to show popup");
      return;
    }

    // Close all existing popups first
    closeAllPopups();

    // Set this marker as active
    setActiveMarkerId(station.id);
    console.log("Set active marker ID:", station.id);

    try {
      // Create popup content
      const popupHTML = createPopupContent(station);
      console.log("Popup HTML created, length:", popupHTML.length);

      // Create and show popup
      const popup = new mapboxgl.Popup({
        offset: [0, -20],
        maxWidth: "400px",
        className: "custom-popup",
        closeButton: true,
        closeOnClick: false,
        anchor: "bottom",
      })
        .setLngLat([station.longitude, station.latitude])
        .setHTML(popupHTML);

      console.log("Popup object created, adding to map...");
      
      popup.addTo(map.current);
      
      console.log("✅ Popup successfully added to map for:", station.name);

      // Store popup reference
      popupsRef.current[station.id] = popup;

      // Add close handler
      popup.on("close", () => {
        console.log("Popup closed for station:", station.name);
        delete popupsRef.current[station.id];
        if (activeMarkerId === station.id) {
          setActiveMarkerId(null);
        }
      });

    } catch (error) {
      console.error("Error creating/showing popup:", error);
    }
  };

  // Add markers for stations when map is initialized
  useEffect(() => {
    if (!map.current || !mapInitialized) {
      console.log("Map not ready yet:", {
        mapExists: !!map.current,
        mapInitialized,
      });
      return;
    }

    console.log(
      `Adding markers for ${filteredStations.length} filtered stations`
    );

    // Remove any existing markers and popups
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    closeAllPopups();
    markersRef.current = {};

    // Add markers for filtered stations
    filteredStations.forEach((station) => {
      console.log("Adding marker for station:", station.name);

      // Validate coordinates
      if (
        !station.latitude ||
        !station.longitude ||
        isNaN(station.latitude) ||
        isNaN(station.longitude)
      ) {
        console.error("Invalid coordinates for station:", station.name);
        return;
      }

      // Create custom marker element
      const markerElement = createMarkerElement(station, false);

      // Add click handler to marker element with more debugging
      markerElement.addEventListener("click", (e) => {
        console.log("🔥 MARKER ELEMENT CLICKED - Event triggered for:", station.name);
        e.stopPropagation();
        e.preventDefault();
        handleMarkerClick(station);
      });

      // Add additional debugging for marker element
      markerElement.style.cursor = "pointer";
      markerElement.style.zIndex = "1000";

      console.log("Created marker element for:", station.name, "with click handler");

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([station.longitude, station.latitude])
        .addTo(map.current!);

      markersRef.current[station.id] = marker;
      console.log("Marker added successfully for:", station.name);
    });

    // Adjust map bounds to fit all markers if there are any
    if (filteredStations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      filteredStations.forEach((station) => {
        if (
          station.latitude &&
          station.longitude &&
          !isNaN(station.latitude) &&
          !isNaN(station.longitude)
        ) {
          bounds.extend([station.longitude, station.latitude]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }
  }, [filteredStations, mapInitialized]);

  // Update marker appearances when active marker changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    console.log("Updating marker appearances, active marker:", activeMarkerId);

    // Update all markers with correct active state
    filteredStations.forEach((station) => {
      const existingMarker = markersRef.current[station.id];
      if (existingMarker) {
        const isActive = activeMarkerId === station.id;

        // Remove old marker
        existingMarker.remove();

        // Create new marker with updated appearance
        const newMarkerElement = createMarkerElement(station, isActive);

        // Add click handler to new element with debugging
        newMarkerElement.addEventListener("click", (e) => {
          console.log("🔥 UPDATED MARKER ELEMENT CLICKED for:", station.name);
          e.stopPropagation();
          e.preventDefault();
          handleMarkerClick(station);
        });

        // Ensure proper styling for clickability
        newMarkerElement.style.cursor = "pointer";
        newMarkerElement.style.zIndex = "1000";

        // Create new marker
        const newMarker = new mapboxgl.Marker(newMarkerElement)
          .setLngLat([station.longitude, station.latitude])
          .addTo(map.current!);

        // Update reference
        markersRef.current[station.id] = newMarker;
      }
    });
  }, [activeMarkerId, filteredStations, mapInitialized]);

  return {
    activeMarkerId,
    closeAllPopups,
  };
};
