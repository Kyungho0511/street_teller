import { useContext, useEffect, useState } from "react";
import LegendSection from "../components/organisms/LegendSection";
import Sidebar from "../components/organisms/Sidebar";
import SidebarSection from "../components/organisms/SidebarSection";
import { SurveyContext } from "../context/SurveyContext";
import { MapContext } from "../context/MapContext";
import useOpenaiInstruction from "../hooks/useOpenaiInstruction";
import { blendColors, crossReferenceList, pathToSection } from "../utils/utils";
import {
  Centroid,
  NUMBER_OF_CLUSTERING_STEPS,
  Report,
} from "../constants/surveyConstants";
import {
  TractFeatureCollection,
  HealthcareProperties,
} from "../constants/geoJsonConstants";
import { applySelectionProps } from "../services/kmeans";
import * as mapbox from "../services/mapbox";
import {
  defaultColor,
  GEOID,
  OUTLINE_LAYER_SELECT,
  THICK_LINE_WEIGHT_SELECT,
} from "../constants/mapConstants";
import { streamOpenAI } from "../services/openai";
import { ReportPrompt } from "../constants/messageConstants";
import { MessageContext } from "../context/MessageContext";
import { useLocation } from "react-router-dom";
import AIResponseList from "../components/molecules/AIReponseList";
import { v4 as uuidv4 } from "uuid";
import PopupSection from "../components/organisms/PopupSection";
import DropdownList from "../components/molecules/DropdownList";
import PopupContentReport from "../components/atoms/PopupContentReport";
import useEffectAfterMount from "../hooks/useEffectAfterMount";
import useMapSelectEffect from "../hooks/useMapSelectEffect";
import { MapQueryContext } from "../context/MapQueryContext";
import useNameFromMap from "../hooks/useNameFromMap";
import Map3dViewer from "../components/organisms/Map3dViewer";
import useMap3dSetViewOnClick from "../hooks/useMap3dSetViewOnClick";
import useFeatureFromMap from "../hooks/useFeatureFromMap";
import Colorbox from "../components/atoms/Colorbox";

/**
 * Report page component where users select sites to report.
 */
export default function ReportPage() {
  const { survey, getClusterSurvey, setReportSurvey } =
    useContext(SurveyContext);
  const { messages } = useContext(MessageContext);
  const { mapViewer, mapMode, parentLayer, layers, geoJsons } =
    useContext(MapContext);
  const { selectedReport, setSelectedReport, selectedGeoId, setSelectedGeoId } =
    useContext(MapQueryContext);
  const [geoJson, setGeoJson] = useState<TractFeatureCollection>();
  const [prompt, setPrompt] = useState<ReportPrompt>();

  const location = useLocation();
  const section = pathToSection(location.pathname);
  const reportName = "report";
  const lastClusterId = NUMBER_OF_CLUSTERING_STEPS;
  const lastCluster = `cluster${lastClusterId}`;
  const prevGeoJson = survey[lastCluster].geoJson;
  const aiMessageLoaded = messages[section].find(
    (message) => message.type === section
  )
    ? true
    : false;

  // Set OpenAI instruction and map select effect.
  useOpenaiInstruction();
  useMapSelectEffect(parentLayer, mapViewer, true);
  useMap3dSetViewOnClick();

  const { selectedFeatures } = useFeatureFromMap("3");
  const { selectedCountyName, selectedNeighborhoodName } = useNameFromMap();

  // Prepare geoJson data for the report page.
  useEffect(() => {
    if (!prevGeoJson || aiMessageLoaded) return;

    const selection = survey[lastCluster].list.map((item) => item.checked);
    const geoJson = applySelectionProps(
      `${lastClusterId}`,
      selection,
      prevGeoJson
    );
    setGeoJson(geoJson);
  }, [prevGeoJson]);

  useEffect(() => {
    if (!geoJson) return;

    // Get unique reports from user selected clusters.
    const clusters = getClusterSurvey();
    const selectedClusterLists = clusters.map((cluster) =>
      cluster.list.filter((item) => item.checked)
    );
    const crossReference = crossReferenceList(selectedClusterLists);

    // Count the number of geoId for each report.
    const reports: Report[] = crossReference.map((list, index) => ({
      name: "",
      content: "",
      clusters: list,
      color: defaultColor,
      geoIds: [],
      index,
      checked: true,
      id: uuidv4(),
    }));

    geoJson.features.forEach((feature, index) => {
      const report = reports.find((report) =>
        report.clusters.every((cluster) => {
          const key = ("cluster" + cluster.clusterId) as HealthcareProperties;
          return feature.properties[key] === cluster.index;
        })
      );
      if (report) {
        report.geoIds.push(feature.properties.GEOID as string);

        // Assign the unique report index to each tract.
        geoJson.features[index].properties.report = report.index;
      }
    });

    // Filter out reports with no geoIds.
    reports.forEach((report, index) => {
      if (report.geoIds.length === 0) {
        reports.splice(index, 1);
      }
    });

    // Assign color to each report.
    reports.forEach((report) => {
      const colors = report.clusters.map((cluster) => cluster.color);
      const color = blendColors(colors);
      report.color = color;
    });

    // Construct prompts for OpenAI.
    const prompt: ReportPrompt = {
      type: "report",
      content: [],
    };
    reports.forEach((report) => {
      const obj: {
        clusters: { name: string; centroids: Centroid[]; reasoning: string }[];
      } = { clusters: [] };
      report.clusters.forEach((cluster) => {
        obj.clusters.push({
          name: cluster.name,
          centroids: cluster.centroids,
          reasoning: cluster.content,
        });
      });
      prompt.content.push(obj);
    });
    setPrompt(prompt);

    // Update the survey context.
    setReportSurvey({
      name: reportName,
      geoJson,
      list: reports,
      colors: reports.map((report) => report.color),
    });

    // Add the geoJson data to the map.
    if (!mapViewer) return;
    mapbox.addReportLayer(reportName, geoJson, mapViewer);

    return () => {
      mapViewer.removeLayer(reportName);
      mapViewer.removeSource(reportName);
    };
  }, [geoJson, mapViewer]);

  // Restore mapping on mapMode change
  useEffectAfterMount(() => {
    if (!mapViewer) return;

    const onStyleLoad = () => {
      // Restore current cluster layer.
      mapbox.restoreLayer(layers[section], geoJsons[section], mapViewer);
      mapbox.setLayerSettings(section, mapViewer);

      // Restore selected GeoId effect.
      selectedGeoId &&
        mapbox.setLineWidth(
          OUTLINE_LAYER_SELECT,
          GEOID,
          selectedGeoId,
          THICK_LINE_WEIGHT_SELECT,
          mapViewer
        );
    };
    mapViewer.on("style.load", onStyleLoad);

    return () => {
      mapViewer.off("style.load", onStyleLoad);
    };
  }, [mapMode]);

  // Turn off Legend section on unmount.
  useEffect(() => {
    return () => {
      setSelectedReport(undefined);
      setSelectedGeoId(undefined);
    };
  }, []);

  return (
    <>
      <Sidebar>
        <SidebarSection>
          <AIResponseList
            surveyName={reportName}
            list={survey.report.list}
            listType={DropdownList}
            colors={survey.report.colors}
            prompt={prompt}
            streamOpenAI={() => streamOpenAI(prompt, messages[section])}
          />
        </SidebarSection>
      </Sidebar>

      {/* Legend for 3d preview */}
      <LegendSection
        title={`${selectedNeighborhoodName}, ${selectedCountyName}`}
        visible={selectedReport !== undefined}
        onClose={() => {
          setSelectedReport(undefined);
          setSelectedGeoId(undefined);
        }}
      >
        <Map3dViewer visible={selectedReport !== undefined} />
        {selectedReport !== undefined && (
          <div>
            <h4 style={{ fontSize: "1.1rem" }}>
              {survey.report.list[selectedReport].name}
            </h4>
            <p style={{ marginTop: 0 }}>
              {survey.report.list[selectedReport].content}
            </p>
          </div>
        )}
        {selectedFeatures?.length &&
          selectedFeatures.map((cluster) => (
            <div key={cluster.id}>
              <div style={{ marginTop: "1rem" }}>
                <Colorbox
                  label={cluster.name}
                  color={cluster.color}
                  fontSize="0.9rem"
                  fontWeight="var(--font-bold)"
                />
                <p style={{ margin: 0 }}>{cluster.content}</p>
              </div>
            </div>
          ))}
      </LegendSection>

      {/* TODO: Add Legend for report information later... */}

      <PopupSection>
        <PopupContentReport />
      </PopupSection>
    </>
  );
}
