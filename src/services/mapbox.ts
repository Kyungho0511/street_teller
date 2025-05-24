import * as mapboxgljs from "mapbox-gl";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  Color,
  mapConfigs,
  MapBound,
  MapLayer,
  transparent,
  ZOOM_MODIFIER,
  themeColor,
  RGBA,
  BEFORE_ID,
  FILL_OUTLINE_COLOR,
} from "../constants/mapConstants";
import { sectionMapConfigs } from "../constants/sectionConstants";
import { ClusterList } from "../constants/surveyConstants";
import { Section } from "../constants/sectionConstants";
import * as utils from "../utils/utils";
import {
  TractFeatureCollection,
  HealthcareProperties,
} from "../constants/geoJsonConstants";
import { MapMode } from "../context/MapContext";

/**
 * Create a mapbox map instance.
 */
export function createMap(
  mapContainerId: string,
  mapMode: MapMode,
  simple: boolean
): mapboxgl.Map {
  mapboxgl.accessToken = import.meta.env.VITE_API_KEY_MAPBOX as string;
  const bounds: mapboxgl.LngLatBoundsLike = [
    [-85, 36], // Southwest coordinates
    [-65, 48], // Northeast coordinates
  ];

  let style;
  if (simple) {
    style =
      mapMode === "map"
        ? mapConfigs.style.mapSimple
        : mapConfigs.style.satelliteSimple;
  } else {
    style =
      mapMode === "map" ? mapConfigs.style.map : mapConfigs.style.satellite;
  }

  const map = new mapboxgl.Map({
    container: mapContainerId,
    style,
    center: mapConfigs.location.center,
    zoom: simple
      ? mapConfigs.location.zoom - ZOOM_MODIFIER
      : mapConfigs.location.zoom,
    bearing: mapConfigs.location.bearing,
    pitch: mapConfigs.location.pitch,
    scrollZoom: true,
    maxBounds: bounds,
    attributionControl: false,
    projection: "globe",
  });
  map.dragRotate.disable();
  map.touchPitch.disable();

  return map;
}

/**
 * Remove the mapbox map instance.
 * @param map Map to remove.
 */
export function removeMap(map: mapboxgl.Map): void {
  map.remove();
}

/**
 * Get the paint type of the mapbox layer.
 */
export function getLayerPaintType(
  layer: MapLayer,
  map: mapboxgl.Map
): string[] | undefined {
  // Exit if the layer type is not found.
  const layerType = map.getLayer(layer.name)?.type;
  if (!layerType) return;

  switch (layerType) {
    case "fill":
      return ["fill-opacity"];
    case "line":
      return ["line-opacity"];
    case "circle":
      return ["circle-opacity", "circle-stroke-opacity"];
    case "symbol":
      return ["icon-opacity", "text-opacity"];
    case "raster":
      return ["raster-opacity"];
    case "background":
      return ["background-opacity"];
    case "fill-extrusion":
      return ["fill-extrusion-opacity"];
    default:
      return;
  }
}

/**
 * Set the opacity of the mapbox layer.
 * @param layer mapbox layer to set opacity.
 * @param map Map in which layer opacity is set.
 */
export function setLayerOpacity(layer: MapLayer, map: mapboxgl.Map): void {
  const paintProps: string[] | undefined = getLayerPaintType(layer, map);
  paintProps &&
    paintProps.forEach(function (prop) {
      map.getLayer(layer.name) &&
        map.setPaintProperty(layer.name, prop, layer.opacity);
    });
}

/**
 * Set layer settings based on the section.
 * @param section Current page section in the application.
 * @param map Map in which layers are set.
 */
export function setLayerSettings(section: Section, map: mapboxgl.Map): void {
  const mapSection = sectionMapConfigs.find((sec) => sec.id === section);
  if (!mapSection) return;

  offLayers(map);
  mapSection.layers.forEach((layer) => setLayerOpacity(layer, map));
}

/**
 * Update a home layer color style on the mapbox map.
 */
export function updateHomeLayer(
  layer: string,
  attribute: HealthcareProperties,
  color: Color,
  map: mapboxgl.Map
) {
  const bound: MapBound = utils.getBound(attribute)!;
  map.setPaintProperty(layer, "fill-color", [
    "interpolate",
    bound.rateOfChange,
    ["get", attribute],
    bound.min,
    utils.rgbaToString(color.min),
    bound.max,
    utils.rgbaToString(color.max),
  ]);
}

/**
 * Update a cluster layer color style on the mapbox map.
 * @param clusterId clustering iteration number.
 * @param clusterList Informs which clusters are selected.
 * @param map Map to which the layer is updated.
 */
export function updateClusterLayer(
  clusterId: string,
  clusterList: ClusterList,
  map?: mapboxgl.Map
) {
  if (!map || !map.getLayer(clusterList.name)) return;

  const list = clusterList.list;
  map.setPaintProperty(clusterList.name, "fill-color", [
    "case",
    ["==", ["get", "cluster" + clusterId], 0],
    list[0].checked ? utils.rgbaToString(list[0].color!) : transparent,
    ["==", ["get", "cluster" + clusterId], 1],
    list[1].checked ? utils.rgbaToString(list[1].color!) : transparent,
    ["==", ["get", "cluster" + clusterId], 2],
    list[2].checked ? utils.rgbaToString(list[2].color!) : transparent,
    ["==", ["get", "cluster" + clusterId], 3],
    list[3].checked ? utils.rgbaToString(list[3].color!) : transparent,
    transparent,
  ]);
}

/**
 * Add a report layer to the mapbox map.
 * @param name Name of the report layer.
 * @param geoJson GeoJson data to be added to the map.
 * @param reports List of reports to be added to the map.
 * @param map Map to which the layer is added.
 */
export function addReportLayer(
  name: string,
  geoJson: TractFeatureCollection,
  map: mapboxgl.Map
) {
  // Remove the layer if it already exists.
  map.getSource(name) && map.removeSource(name);
  map.getLayer(name) && map.removeLayer(name);

  // Add source and layer to the map.
  map.addSource(name, {
    type: "geojson",
    data: geoJson,
  });

  // // color expression for belended colors
  // const fillColorExpression: mapboxgl.DataDrivenPropertyValueSpecification<string> =
  //   ["case"];
  // reports.forEach((report) => {
  //   fillColorExpression.push(
  //     ["==", ["get", "report"], report.index],
  //     utils.rgbaToString(report.color)
  //   );
  // });
  // fillColorExpression.push(transparent);

  map.addLayer(
    {
      id: name,
      type: "fill",
      source: name,
      paint: {
        "fill-color": utils.rgbaToString(themeColor),
        "fill-opacity": 1,
        "fill-outline-color": "rgba(217, 217, 217, 0.36)",
      },
    },
    BEFORE_ID
  );
}

/**
 * Add a source to the mapbox map.
 * @param geoJson GeoJson data to be added to the map.
 * @param name Source name to be added to the map.
 * @param map Map to which the source is added.
 */
export function addSource(
  geoJson: TractFeatureCollection,
  name: string,
  map: mapboxgl.Map
) {
  if (map.getSource(name)) {
    return;
  }
  map.addSource(name, {
    type: "geojson",
    data: geoJson,
  });
}

/**
 * Add a layer to the mapbox map.
 * @param layerName Layer name to be added to the map.
 * @param sourceName Source name to be used for the layer.
 * @param map Map to which the layer is added.
 */
export function addHomeLayer(
  layerName: string,
  sourceName: string,
  map: mapboxgl.Map
) {
  if (map.getLayer(layerName)) {
    return;
  }
  map.addLayer(
    {
      id: layerName,
      type: "fill",
      source: sourceName,
      paint: {
        "fill-color": utils.rgbaToString(themeColor),
        "fill-opacity": 1,
        "fill-outline-color": FILL_OUTLINE_COLOR,
      },
    },
    BEFORE_ID
  );
}

/**
 * Add a cluster layer to the mapbox map.
 * @param clusterList List of clusters to be added to the map.
 * @param sourceName Source name to be used for the layer.
 * @param map Map to which the layer is added.
 */
export function addClusterLayer(
  clusterList: ClusterList,
  sourceName: string,
  map: mapboxgl.Map
) {
  console.log("Adding cluster layer", clusterList.name);

  if (map.getLayer(clusterList.name)) {
    return;
  }
  map.addLayer(
    {
      id: clusterList.name,
      type: "fill",
      source: sourceName,
      paint: {
        "fill-color": [
          "case",
          ["all", ["==", ["get", clusterList.name], 0], ["get", "selected"]],
          utils.rgbaToString(clusterList.list[0].color),
          ["all", ["==", ["get", clusterList.name], 1], ["get", "selected"]],
          utils.rgbaToString(clusterList.list[1].color),
          ["all", ["==", ["get", clusterList.name], 2], ["get", "selected"]],
          utils.rgbaToString(clusterList.list[2].color),
          ["all", ["==", ["get", clusterList.name], 3], ["get", "selected"]],
          utils.rgbaToString(clusterList.list[3].color),
          transparent,
        ],
        "fill-opacity": 1,
        "fill-outline-color": "rgba(217, 217, 217, 0.36)",
      },
    },
    BEFORE_ID
  );
}

/**
 * Remove a cluster layer from the mapbox map.
 * @param clusterList List of clusters to be removed.
 * @param map Map from which the layer is removed.
 */
export function removeClusterLayer(
  clusterList: ClusterList,
  map: mapboxgl.Map
) {
  if (map.getLayer(clusterList.name)) {
    map.removeLayer(clusterList.name);
  }
}
/**
 * Remove all cluster layers from the mapbox map.
 * @param clusterListCollection Collection of cluster lists to be removed.
 * @param map Map from which the layers are removed.
 */
export function removeAllClusterLayers(
  clusterListCollection: ClusterList[],
  map: mapboxgl.Map
) {
  clusterListCollection.forEach((list) => {
    removeClusterLayer(list, map);
  });
}

/**
 * Restore a layer on the mapbox map from cached data.
 * @param layer Layer to be restored.
 * @param source Source to be restored.
 * @param map Map from which the layer is restored.
 */
export function restoreLayer(
  layer: mapboxgl.LayerSpecification | mapboxgl.CustomLayerInterface,
  source: mapboxgl.SourceSpecification,
  map: mapboxgl.Map
) {
  map.getSource(layer.id) && map.removeSource(layer.id);
  map.addSource(layer.id, source);

  map.getLayer(layer.id) && map.removeLayer(layer.id);
  map.addLayer(layer, BEFORE_ID);
}

/**
 * Turn off all layers by setting opacity to 0.
 * @param map Map in which the layers are turned off.
 */
export function offLayers(map: mapboxgl.Map) {
  sectionMapConfigs.forEach((sec) => {
    sec.layers.forEach((layer) => {
      setLayerOpacity({ name: layer.name, opacity: 0 }, map);
    });
  });
}

/**
 * Check if the feature is active. Inactive features are hidden with a transparent color.
 * @param layer Name of the layer that contains features to be checked.
 * @param event Map event to check if the interacted feature is active.
 * @param map Map in which the features are tested.
 * @returns False if the feature is hidden or not found.
 */
export function isActiveFeature(
  layer: string,
  event: mapboxgl.MapMouseEvent,
  map: mapboxgl.Map
): boolean {
  const feature = map.queryRenderedFeatures(event.point, {
    layers: [layer],
  })[0];
  const paint = feature?.layer?.paint;

  if (paint == null) {
    return false;
  }
  const fillColor = (paint as { "fill-color": RGBA })["fill-color"];

  return !utils.isTransparent(fillColor);
}

/**
 * Set the line weight of the selected feature.
 * @param layer Name of the layer.
 * @param key Name of the layer property id.
 * @param value Value of layer property id to compare.
 * @param lineWeight Line weight of the outline.
 */
export function setLineWidth(
  layer: string,
  key: string,
  value: number,
  lineWeight: number,
  map: mapboxgl.Map
) {
  map.setPaintProperty(layer, "line-width", [
    "case",
    ["==", ["get", key], value],
    lineWeight,
    0,
  ]);
}

/**
 * Hide the line width of the mapbox layer.
 * @param layer Name of the layer to hide.
 */
export function hideLineWidth(layer: string, map: mapboxgl.Map) {
  map.setPaintProperty(layer, "line-width", 0);
}

/**
 * Add mapbox map controls.
 * @param container Container to which the controls are located.
 */
export function addControls(
  container: HTMLElement,
  map: mapboxgl.Map
): HTMLElement[] {
  if (!container || !map) return [];

  const geolocationControl = new mapboxgl.GeolocateControl();
  const navigationControl = new mapboxgl.NavigationControl({
    showCompass: false,
  });
  const controls: mapboxgl.IControl[] = [geolocationControl, navigationControl];
  const controlElements: HTMLElement[] = [];

  controls.forEach((control) => {
    const controlElement = control.onAdd(map);
    container.appendChild(controlElement);
    controlElements.push(controlElement);
  });

  return controlElements;
}

/**
 * Add a location search button to the mapbox map.
 * @param container Container to which the search button is located.
 * @returns Search button element.
 */
export function addSearchButton(
  container: HTMLElement,
  map: mapboxgl.Map
): HTMLElement {
  const geocoder = new MapboxGeocoder({
    accessToken: import.meta.env.VITE_API_KEY_MAPBOX as string,
    mapboxgl: mapboxgljs,
    marker: true,
    placeholder: "Search location",
    collapsed: true,
    bbox: mapConfigs.bbox,
  });

  const searchButton = geocoder.onAdd(map);
  container.appendChild(searchButton);

  return searchButton;
}

/**
 * Relocate the mapbox logo element to the input container.
 * @param container Container to which the logo is relocated.
 */
export function relocateLogo(container: HTMLElement) {
  const logo = document.querySelector(
    `.mapboxgl-ctrl-logo`
  ) as HTMLElement | null;
  if (logo == null) return;

  container.appendChild(logo);
}
