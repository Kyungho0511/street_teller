import { v4 as uuidv4 } from "uuid";
import {
  TractProperties,
  HealthcareProperties,
  ClusterProperties,
} from "./geoJsonConstants";
import { color, RGBA, transparentColor } from "./mapConstants";
import { iconPaths } from "./IconConstants";
import { NUMBER_OF_CLUSTERS } from "./kMeansConstants";
import { Survey } from "../context/SurveyContext";
import { KMeansResult } from "ml-kmeans/lib/KMeansResult";
import { Section } from "./sectionConstants";

/**
 * Site preference categories of the user survey.
 */
export type SiteCategory =
  | "Unserved Population Density"
  | "Insured Population Density"
  | "Health Status"
  | "Income & Expenses"
  | "Land Use"
  | "Mode of Transportation";

export type Preference = {
  category: SiteCategory;
  ranking: number;
  iconPath: string;
  selected: boolean;
  id: string;
  subCategories: { name: HealthcareProperties; id: string }[];
};

export type PreferenceList = {
  name: "preference";
  list: Preference[];
};

export const initialPreferenceList: PreferenceList = {
  name: "preference",
  list: [
    {
      category: "Unserved Population Density",
      ranking: 1,
      iconPath: iconPaths.unservedPopulation,
      selected: true,
      id: uuidv4(),
      subCategories: [
        { name: "unserved population / km2", id: uuidv4() },
        { name: "unserved medicaid enrollees / km2", id: uuidv4() },
        { name: "unserved commercial enrollees / km2", id: uuidv4() },
      ],
    },
    {
      category: "Insured Population Density",
      ranking: 2,
      iconPath: iconPaths.insuredPopulation,
      selected: false,
      id: uuidv4(),
      subCategories: [
        { name: "insured population / km2", id: uuidv4() },
        { name: "medicaid enrollees / km2", id: uuidv4() },
        { name: "commercial enrollees / km2", id: uuidv4() },
      ],
    },
    {
      category: "Health Status",
      ranking: 3,
      iconPath: iconPaths.healthStatus,
      selected: false,
      id: uuidv4(),
      subCategories: [
        { name: "no leisure-time physical activity", id: uuidv4() },
        { name: "binge drinking", id: uuidv4() },
        { name: "sleeping less than 7 hours", id: uuidv4() },
        { name: "current smoking", id: uuidv4() },
        { name: "cholesterol screening", id: uuidv4() },
        { name: "current lack of health insurance", id: uuidv4() },
        { name: "taking medicine for high blood pressure", id: uuidv4() },
        { name: "visits to dentist or dental clinic", id: uuidv4() },
        { name: "visits to doctor for routine checkup", id: uuidv4() },
        { name: "physical health not good for >=14 days", id: uuidv4() },
        { name: "mental health not good for >=14 days", id: uuidv4() },
        { name: "fair or poor self-rated health status", id: uuidv4() },
      ],
    },
    {
      category: "Income & Expenses",
      ranking: 4,
      iconPath: iconPaths.income,
      selected: false,
      id: uuidv4(),
      subCategories: [
        { name: "average land price / ft2", id: uuidv4() },
        { name: "median household income", id: uuidv4() },
        { name: "median household disposable income", id: uuidv4() },
        { name: "median monthly housing cost", id: uuidv4() },
      ],
    },
    {
      category: "Land Use",
      ranking: 5,
      iconPath: iconPaths.landUse,
      selected: false,
      id: uuidv4(),
      subCategories: [
        { name: "agricultural land percent", id: uuidv4() },
        { name: "residential district percent", id: uuidv4() },
        { name: "commercial district percent", id: uuidv4() },
        { name: "industrial district percent", id: uuidv4() },
        { name: "vacant land percent", id: uuidv4() },
      ],
    },
    {
      category: "Mode of Transportation",
      ranking: 6,
      iconPath: iconPaths.transportation,
      selected: false,
      id: uuidv4(),
      subCategories: [
        { name: "drove alone percent", id: uuidv4() },
        { name: "carpooled percent", id: uuidv4() },
        { name: "public transit percent", id: uuidv4() },
        { name: "walked percent", id: uuidv4() },
        { name: "worked from home percent", id: uuidv4() },
      ],
    },
  ],
};

export const siteCategories = initialPreferenceList.list.map(
  ({ category, subCategories }) => ({
    category,
    subCategories,
  })
);

export const NUMBER_OF_CLUSTERING_STEPS = 3;

export type Centroid = {
  name: HealthcareProperties;
  value: number;
  id: string;
};

export type ListItem = {
  name: string;
  content: string;
  color: RGBA;
  checked: boolean;
  id: string;
  centroids?: Centroid[];
  geoIds?: string[];
};

export type Cluster = ListItem & {
  name: string;
  content: string;
  centroids: Centroid[];
  color: RGBA;
  index: number;
  clusterId: string;
  checked: boolean;
  id: string;
};

export type Report = ListItem & {
  name: string;
  content: string;
  clusters: Cluster[];
  color: RGBA;
  geoIds: string[];
  index: number;
  checked: boolean;
  id: string;
};

export type GeoIdDictionary = Record<
  string,
  Record<ClusterProperties, string | boolean>
>;

export type ClusterList = {
  name: `cluster1` | `cluster2` | `cluster3`;
  list: Cluster[];
  colors: RGBA[];
  geoIdDict: GeoIdDictionary | undefined;
  attributes: HealthcareProperties[];
  kMeansResult: KMeansResult | undefined;
};

export type ReportList = {
  name: "report";
  geoIdDict: GeoIdDictionary | undefined;
  list: Report[];
  colors: RGBA[];
};

export type ReportSubList = {
  name: string;
  content: string;
  color: RGBA;
  id: string;
}[];

export const initialSurvey: Survey = {
  preference: initialPreferenceList,
  cluster1: createClusterList("1", color.yellow.categorized),
  cluster2: createClusterList("2", color.blue.categorized),
  cluster3: createClusterList("3", color.green.categorized),
  report: {
    name: "report",
    list: [],
    colors: [],
    geoIdDict: undefined,
  } as ReportList,
};

/**
 * Create a cluster list with default values.
 */
function createClusterList(clusterId: string, colors: RGBA[]): ClusterList {
  const list: Cluster[] = Array.from(
    { length: NUMBER_OF_CLUSTERS },
    (_, i) => ({
      name: "",
      centroids: [],
      content: "",
      color: transparentColor,
      checked: true,
      index: i,
      clusterId,
      id: uuidv4(),
    })
  );
  return {
    name: `cluster${clusterId}` as ClusterList["name"],
    list,
    colors,
    geoIdDict: undefined,
    attributes: [],
    kMeansResult: undefined,
  };
}
