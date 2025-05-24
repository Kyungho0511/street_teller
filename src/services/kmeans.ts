import { kmeans, Options } from "ml-kmeans";
import { KMeansResult } from "ml-kmeans/lib/KMeansResult";
import { Feature } from "geojson";
import {
  TractFeature,
  TractFeatureCollection,
  HealthcareProperties,
  clusterProperties,
  ClusterProperties,
} from "../constants/geoJsonConstants";
import {
  INITIALIZATION,
  MAX_ITERATIONS,
  NUMBER_OF_CLUSTERS,
  SEED,
} from "../constants/kMeansConstants";
import { normalize } from "../utils/utils";
import { Section } from "../constants/sectionConstants";
import {
  ReportList,
  ClusterList,
  GeoIdDictionary,
} from "../constants/surveyConstants";

/**
 * Run kmeans clustering analysis.
 * @param data 2D array data to be clustered.
 * @returns KMeans clustering result.
 */
export function runKMeans(data: number[][]): KMeansResult {
  // Run kMeans clustering
  const options: Options = {
    seed: SEED,
    initialization: INITIALIZATION,
    maxIterations: MAX_ITERATIONS,
  };
  return kmeans(data, NUMBER_OF_CLUSTERS, options);
}

/**
 * Process geojson data into 2D array for clustering analysis.
 * @param geoJson The raw geojson data.
 * @param attributes Names of the attributes to filter the data.
 * @returns 2D array of the filtered data.
 */
export function processData(
  geoJson: TractFeatureCollection,
  attributes: HealthcareProperties[]
): number[][] {
  // Filter the features based on the selected attributes and tracts.
  const filteredFeatures = geoJson.features.map((feature: TractFeature) => {
    let filteredProperties: Partial<{
      [key in HealthcareProperties]: number;
    }> = {};

    attributes.forEach((attr) => {
      if (Object.prototype.hasOwnProperty.call(feature.properties, attr)) {
        const normalized = normalize(feature.properties[attr] as number, attr);
        if (filteredProperties) {
          filteredProperties[attr] = normalized;
        } else {
          filteredProperties = { [attr]: normalized };
        }
      }
    });
    
    return {
      ...feature,
      properties: filteredProperties,
    };
  });
  // Convert the filtered features to a 2D array
  return filteredFeatures.map((item) => Object.values(item.properties));
}

/**
 * Assign the kMeans clustering result to the geoJson in place.
 * @param geoJson The geoJson to be assigned.
 * @param kMeansResult The kMeans clustering result.
 * @param key geoJson feature property key to assign the clustering result.
 */
export function assignToGeoJson(
  geoJson: TractFeatureCollection,
  kMeansResult: KMeansResult,
  key: Section
) {
  geoJson.features.forEach((feature: Feature, index) => {
    feature.properties![key] = kMeansResult.clusters[index];
  });
}

/**
 * Get the cluster properties of clustering analysis
 * from the geoJson for session storage purpose.
 * @param geoJson The geoJson to get the properties from.
 */
export function getGeoJsonClusterProps(
  geoJson: TractFeatureCollection
): GeoIdDictionary {
  const geoIdDict = {} as GeoIdDictionary;
  geoJson.features.forEach((feature) => {
    const geoId = feature?.properties?.GEOID;
    if (geoId) {
      const properties = Object.entries(feature.properties).filter(([key]) =>
        clusterProperties.includes(key as ClusterProperties)
      );
      geoIdDict[geoId as string] = Object.fromEntries(properties) as Record<
        ClusterProperties,
        string | boolean
      >;
    }
  });

  return geoIdDict;
}

/**
 * Apply user's selection of clusters to the geoJson.
 * @param selection user's selection of clusters.
 * @param clusterList informs the cluster list to be selected.
 */
export function applySelectionProps(
  geoJson: TractFeatureCollection,
  clusterList: ClusterList | ReportList
) {
  const selection = clusterList.list.map((item) => item.checked);
  const key = clusterList.name as ClusterProperties;
  geoJson.features.forEach((feature) => {
    const clusterIdx = feature.properties[key];
    feature.properties.selected = selection[clusterIdx as number];
  });
}
