import { useContext, useEffect, useState } from "react";
import useEffectAfterMount from "./useEffectAfterMount";
import { MapContext } from "../context/MapContext";

/**
 * Custom hook to fetch geoJson data from the file path.
 * @param filePath File path of the geoJson data
 * @param mapViewer Map instance to add the geoJson data
 */
export default function useGeoJson(
  filePath: string,
  mapViewer: mapboxgl.Map | undefined
) {
  const [loadingGeoJson, setLoadingGeoJson] = useState<boolean>(false);
  const [errorGeoJson, setErrorGeoJson] = useState<string | undefined>();
  const { geoJson, setGeoJson } = useContext(MapContext);

  // Fetch geoJson data from the file path.
  useEffect(() => {
    setLoadingGeoJson(true);
    setErrorGeoJson(undefined);
    if (!geoJson) {
      const fetchData = async () => {
        try {
          const response = await fetch(filePath);
          const data = await response.json();
          setGeoJson(data);
        } catch {
          const errorMessage = "Failed to fetch GeoJson data";
          setErrorGeoJson(errorMessage);
          console.error(errorMessage);
        } finally {
          setLoadingGeoJson(false);
        }
      };
      fetchData();
    }
  }, []);

  useEffectAfterMount(() => {
    if (!mapViewer || !geoJson) return;
    // Add selected properties to geoJson data.
    geoJson.features.forEach((feature) => {
      feature.properties.selected = true;
    });
  }, [mapViewer, geoJson]);

  return { loadingGeoJson, errorGeoJson };
}
