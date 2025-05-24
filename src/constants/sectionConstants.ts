import { Message } from "../context/MessageContext";
import { getBound } from "../utils/utils";
import { color, MapSection } from "./mapConstants";

/**
 * Sections(pages) of the website.
 */
export type Section = "home" | `cluster1` | `cluster2` | `cluster3` | "report";

export const sectionMapConfigs: MapSection[] = [
  {
    id: "home",
    layers: [
      { name: "tracts", opacity: 0.9 },
      { name: "nyc-tracts", opacity: 1 },
    ],
    attribute: {
      name: "unserved population / km2",
      bound: getBound("unserved population / km2")!,
      unit: "population density",
    },
    parentLayer: "nyc-tracts",
    color: color.blue,
  },
  {
    id: "cluster1",
    layers: [
      { name: "tracts", opacity: 0.9 },
      { name: "cluster1", opacity: 1 },
    ],
    parentLayer: "cluster1",
    color: color.yellow,
  },
  {
    id: "cluster2",
    layers: [
      { name: "tracts", opacity: 0.9 },
      { name: "cluster2", opacity: 1 },
    ],
    parentLayer: "cluster2",
    color: color.blue,
  },
  {
    id: "cluster3",
    layers: [
      { name: "tracts", opacity: 0.9 },
      { name: "cluster3", opacity: 1 },
    ],
    parentLayer: "cluster3",
    color: color.green,
  },
  {
    id: "report",
    layers: [
      { name: "tracts", opacity: 0.9 },
      { name: "report", opacity: 1 },
    ],
    parentLayer: "report",
  },
];

export const initialSectionMessages: Record<Section, Message[]> = {
  home: [],
  cluster1: [],
  cluster2: [],
  cluster3: [],
  report: [],
};
