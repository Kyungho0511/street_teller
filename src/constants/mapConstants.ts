import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import * as utils from "../utils/utils";
import { HealthcareProperties } from "./geoJsonConstants";
import { Section } from "./sectionConstants";

export type Location = {
  center: mapboxgl.LngLat;
  zoom: number;
  pitch: number;
  bearing: number;
};

export const mapConfigs = {
  style: {
    map: "mapbox://styles/klee0511/cm2hy9ofn00an01pb8q8q8fw8",
    mapSimple: "mapbox://styles/klee0511/cm3zccrck00hq01s05gfkacue",
    satellite: "mapbox://styles/klee0511/cm3nx3g9o00mj01r22uldc1ib",
    satelliteSimple: "mapbox://styles/klee0511/cm3zcek8m00g301qr7x9d80h2",
  },
  location: {
    center: {
      lng: -73.860766,
      lat: 40.713326,
    },
    zoom: 11,
    pitch: 0,
    bearing: 0,
  } as Location,
  // NYC 5 boroughs bounding box
  bbox: [-74.25909, 40.477399, -73.700272, 40.917577] as MapboxGeocoder.Bbox,
};

/**
 * Layer ID to insert new layers before
 */
export const BEFORE_ID = "road-simple";

export const GEOID = "GEOID";

export const TRACTS_SOURCE = "nyc-tracts";

export const OUTLINE_LAYER_HOVER = "tracts-features-nyc-outline-hover";

export const OUTLINE_LAYER_SELECT = "tracts-features-nyc-outline-select";

export const THICK_LINE_WEIGHT_HOVER = 3;

export const THICK_LINE_WEIGHT_SELECT = 6;

export const ZOOM_MODIFIER = 3;

export const POPUP = {
  width: 300,
  height: 200,
  offset: 30,
};

export const transparent = utils.rgbaToString({
  r: 255,
  g: 255,
  b: 255,
  a: 0,
});

export const transparentColor: RGBA = {
  r: 255,
  g: 255,
  b: 255,
  a: 0,
};

export const defaultColor: RGBA = {
  r: 255,
  g: 255,
  b: 255,
  a: 255,
};

export const themeColor: RGBA = {
  r: 50,
  g: 125,
  b: 255,
  a: 255,
};

export const FILL_OUTLINE_COLOR = "rgba(217, 217, 217, 0.36)";

export type Color = {
  categorized: RGBA[];
  min: RGBA;
  max: RGBA;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export const color: { [key in string]: Color } = {
  blue: {
    categorized: [
      { r: 179, g: 232, b: 235, a: 0.8 },
      { r: 99, g: 193, b: 231, a: 0.8 },
      { r: 32, g: 157, b: 234, a: 0.8 },
      { r: 80, g: 122, b: 236, a: 0.8 },
    ],
    min: { r: 247, g: 250, b: 255, a: 0.8 },
    max: { r: 0, g: 110, b: 254, a: 0.8 },
  },
  yellow: {
    categorized: [
      { r: 247, g: 233, b: 0, a: 0.8 },
      { r: 255, g: 200, b: 0, a: 0.8 },
      { r: 244, g: 137, b: 75, a: 0.8 },
      { r: 226, g: 102, b: 102, a: 0.8 },
    ],
    min: { r: 255, g: 250, b: 236, a: 0.8 },
    max: { r: 249, g: 162, b: 0, a: 0.8 },
  },
  green: {
    categorized: [
      { r: 216, g: 227, b: 115, a: 0.8 },
      { r: 178, g: 226, b: 120, a: 0.8 },
      { r: 102, g: 205, b: 90, a: 0.8 },
      { r: 93, g: 182, b: 190, a: 0.8 },
    ],
    min: { r: 227, g: 209, b: 173, a: 0.8 },
    max: { r: 42, g: 169, b: 181, a: 0.8 },
  },
};

export type UnitType =
  | "population density"
  | "percentage"
  | "percentage * 100"
  | "dollar"
  | "dollar * 50";

export type MapLayer = {
  name: string;
  opacity: number;
};

export type MapBound = {
  min: number;
  max: number;
  rateOfChange: ["exponential", number] | ["linear"];
};

export type MapAttribute = {
  name: HealthcareProperties;
  bound: MapBound;
  unit: UnitType;
};

export const mapAttributes: MapAttribute[] = [
  {
    name: "medicaid enrollees / km2",
    bound: {
      min: 48.19,
      max: 55472.48,
      rateOfChange: ["exponential", 0.99995],
    },
    unit: "population density",
  },
  {
    name: "commercial enrollees / km2",
    bound: {
      min: 214.31,
      max: 42294.7,
      rateOfChange: ["exponential", 0.99995],
    },
    unit: "population density",
  },
  {
    name: "insured population / km2",
    bound: { min: 316.5, max: 76410.9, rateOfChange: ["exponential", 0.99995] },
    unit: "population density",
  },
  {
    name: "unserved population / km2",
    bound: { min: 12.7, max: 45610.7, rateOfChange: ["exponential", 0.99995] },
    unit: "population density",
  },
  {
    name: "unserved medicaid enrollees / km2",
    bound: { min: 0.0, max: 45610.7, rateOfChange: ["exponential", 0.99995] },
    unit: "population density",
  },
  {
    name: "unserved commercial enrollees / km2",
    bound: { min: 0.0, max: 12665.9, rateOfChange: ["exponential", 0.99995] },
    unit: "population density",
  },
  {
    name: "average land price / ft2",
    bound: { min: 2.67, max: 34.29, rateOfChange: ["linear"] },
    unit: "dollar * 50",
  },
  {
    name: "agricultural land percent",
    bound: { min: 0.0, max: 0.1, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "residential district percent",
    bound: { min: 0.08, max: 1.0, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "vacant land percent",
    bound: { min: 0.0, max: 0.53, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "commercial district percent",
    bound: { min: 0.0, max: 0.48, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "industrial district percent",
    bound: { min: 0.0, max: 0.08, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "drove alone percent",
    bound: { min: 0.01, max: 0.72, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "carpooled percent",
    bound: { min: 0.0, max: 0.28, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "public transit percent",
    bound: { min: 0.09, max: 0.94, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "walked percent",
    bound: { min: 0.0, max: 0.58, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "worked from home percent",
    bound: { min: 0.0, max: 0.34, rateOfChange: ["linear"] },
    unit: "percentage * 100",
  },
  {
    name: "no leisure-time physical activity",
    bound: { min: 17.5, max: 51.2, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "binge drinking",
    bound: { min: 8.8, max: 22.2, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "sleeping less than 7 hours",
    bound: { min: 28.4, max: 46.8, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "current smoking",
    bound: { min: 7.9, max: 30.1, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "cholesterol screening",
    bound: { min: 70.6, max: 92.9, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "current lack of health insurance",
    bound: { min: 4.1, max: 30.4, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "taking medicine for high blood pressure",
    bound: { min: 57.2, max: 86.8, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "visits to dentist or dental clinic",
    bound: { min: 34.6, max: 77.2, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "visits to doctor for routine checkup",
    bound: { min: 67.4, max: 85.6, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "physical health not good for >=14 days",
    bound: { min: 7.0, max: 21.7, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "mental health not good for >=14 days",
    bound: { min: 10.4, max: 27.7, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "fair or poor self-rated health status",
    bound: { min: 9.4, max: 39.1, rateOfChange: ["linear"] },
    unit: "percentage",
  },
  {
    name: "median household income",
    bound: { min: 17083.0, max: 191083.0, rateOfChange: ["linear"] },
    unit: "dollar",
  },
  {
    name: "median household disposable income",
    bound: { min: 3107.0, max: 150067.0, rateOfChange: ["linear"] },
    unit: "dollar",
  },
  {
    name: "median monthly housing cost",
    bound: { min: 388.0, max: 3418.0, rateOfChange: ["linear"] },
    unit: "dollar",
  },
];

export type MapSection = {
  id: Section;
  layers: MapLayer[];
  // Parent layer containing attributes
  parentLayer: string;
  // Attribute in parent layer to be visualized.
  attribute?: MapAttribute;
  // Color for attributes
  color?: Color;
};
