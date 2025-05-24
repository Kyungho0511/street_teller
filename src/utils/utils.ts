import { HealthcareProperties } from "../constants/geoJsonConstants";
import { Section } from "../constants/sectionConstants";
import {
  RGBA,
  MapBound,
  UnitType,
  mapAttributes,
} from "../constants/mapConstants";
import census_tract_to_nta from "../assets/data/census_tract_to_nta.json";
import { Position } from "geojson";

/**
 * Returns the section name corresponding to the path.
 * @param path Url path name.
 */
export function pathToSection(path: string): Section {
  if (path === "/") {
    return "home";
  }

  const clusterMatch = path.match(/^\/cluster\/(\d+)$/);
  if (clusterMatch) {
    return `cluster${clusterMatch[1]}` as Section;
  }

  if (path === "/report") {
    return "report";
  }

  return "home";
}

/**
 * Get the bound corresponding to the attribute name.
 * @param attribute name of the attribute in search for the bound.
 */
export function getBound(attribute: HealthcareProperties): MapBound {
  return mapAttributes.find((attr) => attr.name === attribute)!.bound;
}

/**
 * Get the unit type corresponding to the attribute name.
 * @param attribute name of the attribute in search for the unit type.
 */
export function getUnit(attribute: HealthcareProperties): UnitType | undefined {
  return mapAttributes.find((attr) => attr.name === attribute)?.unit;
}

/**
 * Format the number based on the unit type.
 * @param num number to be formatted.
 * @param unit unit type to be used for formatting.
 */
export function formatUnit(num: number, unit: UnitType): string {
  switch (unit) {
    case "population density":
      return `${Math.round(num / 100) / 10}k`;
    case "percentage":
      return `${Math.round(num)}%`;
    case "percentage * 100":
      return `${Math.round(num * 100)}%`;
    case "dollar":
      return `$ ${Math.round(num).toLocaleString("en-US")}`;
    case "dollar * 50":
      return `$ ${Math.round(num * 50).toLocaleString("en-US")}`;
    default:
      return `${Math.round(num)}`;
  }
}

/**
 * Restore original value of the normalized number(0-1)
 * @param value value to be restored.
 * @param attribute attribute name to be used for restoring.
 */
export function unNormalize(
  value: number,
  attribute: HealthcareProperties
): number {
  const bound = getBound(attribute);
  return (bound.max - bound.min) * value;
}

/**
 * Normalize the value to be between 0 and 1.
 * @param value value to be normalized.
 * @param attribute attribute name to be used for normalization.
 */
export function normalize(
  value: number,
  attribute: HealthcareProperties
): number {
  const bound = getBound(attribute);
  return value / (bound.max - bound.min);
}

/**
 * Get the series of numbers from 1 to value.
 * @param count number of series to be generated.
 */
export function getSeriesNumber(count: number) {
  const series = [];
  for (let i = 1; i < count + 1; i++) {
    series.push(i);
  }
  return series;
}

/**
 * Parse characters from the string.
 * @param value value to be parsed.
 */
export function parseString(value: string): string {
  return value.match(/[a-zA-Z]+/)![0];
}

/**
 * Check if the fill color is white.
 * @param fillColor Fill color to check.
 */
export function isTransparent(fillColor: RGBA): boolean {
  return fillColor.a == 0;
}

/**
 * Get the county name from the geoid.
 */
export function getCountyName(geoid: string): string {
  const dict = census_tract_to_nta as Record<
    string,
    { BoroName: string; NTAName: string }
  >;
  return dict[geoid].BoroName;
}

/**
 * Get the neighborhood name from the geoid.
 */
export function getNeighborhoodName(geoid: string): string {
  const dict = census_tract_to_nta as Record<
    string,
    { BoroName: string; NTAName: string }
  >;
  return dict[geoid].NTAName;
}

/**
 * Get the tract name from the geoid.
 */
export function getTractName(geoid: string): string {
  return `Census Tract ${geoid.slice(-6)}`;
}

/**
 * Get blended color from the list of colors.
 */
export function blendColors(colors: RGBA[]): RGBA {
  const blendedColor = colors.reduce(
    (prev, curr) => {
      return {
        r: prev.r + curr.r,
        g: prev.g + curr.g,
        b: prev.b + curr.b,
        a: prev.a + curr.a,
      };
    },
    { r: 0, g: 0, b: 0, a: 0 }
  );
  const colorCount = colors.length;

  return {
    r: Math.round(blendedColor.r / colorCount),
    g: Math.round(blendedColor.g / colorCount),
    b: Math.round(blendedColor.b / colorCount),
    a: Math.round(blendedColor.a / colorCount),
  } as RGBA;
}

/**
 * Convert RGBA to string.
 */
export function rgbaToString(color: RGBA): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

/**
 * Cross reference the 2 dimensional list of numbers. (recursive)
 */
export function crossReferenceList<T>(list: T[][]): T[][] {
  const crossReferenced: T[][] = [];

  function generateCombinations(prefix: T[], remainingLists: T[][]) {
    if (remainingLists.length === 0) {
      crossReferenced.push(prefix);
      return;
    }
    const [firstList, ...restLists] = remainingLists;
    for (const item of firstList) {
      generateCombinations([...prefix, item], restLists);
    }
  }
  generateCombinations([], list);
  return crossReferenced;
}

/**
 * Get the center coordinate of multiple coordinates.
 * @param coordinates Coordinates of longitude and latitude to get the center.
 */
export function getCenterCoordinate(coordinates: Position[]): Position {
  const center: Position = [0, 0];
  for (const coord of coordinates) {
    center[0] += coord[0];
    center[1] += coord[1];
  }
  center[0] /= coordinates.length;
  center[1] /= coordinates.length;

  return center;
}
