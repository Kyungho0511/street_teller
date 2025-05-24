import { useContext, useState } from "react";
import { Cluster } from "../constants/surveyConstants";
import { MapQueryContext } from "../context/MapQueryContext";
import { Survey, SurveyContext } from "../context/SurveyContext";
import {
  TractProperties,
  HealthcareProperties,
} from "../constants/geoJsonConstants";
import useEffectAfterMount from "./useEffectAfterMount";

/**
 * Custom hook to get cluster features from the map.
 */
export default function useFeatureFromMap(clusterId: string) {
  const { survey } = useContext(SurveyContext);
  const { hoveredProperty, selectedProperty } = useContext(MapQueryContext);
  const [hoveredFeatures, setHoveredFeatures] = useState<Cluster[]>();
  const [currentHoveredFeature, setCurrentHoveredFeature] = useState<Cluster>();
  const [selectedFeatures, setSelectedFeatures] = useState<Cluster[]>();
  const [currentSelectedFeature, setCurrentSelectedFeature] =
    useState<Cluster>();

  // Helper function to get features for a property
  const getFeatures = (
    property: TractProperties | undefined
  ): Cluster[] | undefined => {
    if (!property) return;

    const features: Cluster[] = [];
    for (let i = 1, n = parseInt(clusterId) + 1; i < n; i++) {
      const clusterKey = `cluster${i}`;
      const clusterList = survey[clusterKey as keyof Survey];
      const cluster =
        clusterList.list[
          property[clusterKey as HealthcareProperties] as number
        ];
      features.push(cluster as Cluster);
    }
    return features;
  };

  // Set features based on the Hovered property's cluster ID.
  useEffectAfterMount(() => {
    const features = getFeatures(hoveredProperty) as Cluster[];
    if (!features || features.length === 0) return;

    setHoveredFeatures(features);
    setCurrentHoveredFeature(features[features.length - 1]);
  }, [hoveredProperty]);

  // Set features based on the Selected property's cluster ID.
  useEffectAfterMount(() => {
    const features = getFeatures(selectedProperty) as Cluster[];
    if (!features || features.length === 0) return;

    setSelectedFeatures(features);
    setCurrentSelectedFeature(features[features.length - 1]);
  }, [selectedProperty]);

  return {
    hoveredFeatures,
    currentHoveredFeature,
    selectedFeatures,
    currentSelectedFeature,
  };
}
