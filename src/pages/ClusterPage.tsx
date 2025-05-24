import { useContext, useEffect, useState } from "react";
import AIResponseList from "../components/molecules/AIReponseList";
import LegendSection from "../components/organisms/LegendSection";
import SidebarSection from "../components/organisms/SidebarSection";
import { SurveyContext } from "../context/SurveyContext";
import { useLocation, useParams } from "react-router-dom";
import * as kmeans from "../services/kmeans";
import { KMeansResult } from "ml-kmeans/lib/KMeansResult";
import { MapContext } from "../context/MapContext";
import * as utils from "../utils/utils";
import { HealthcareProperties } from "../constants/geoJsonConstants";
import * as mapbox from "../services/mapbox";
import useEffectAfterMount from "../hooks/useEffectAfterMount";
import PopupSection from "../components/organisms/PopupSection";
import PopupContentCluster from "../components/atoms/PopupContentCluster";
import Sidebar from "../components/organisms/Sidebar";
import useOpenaiInstruction from "../hooks/useOpenaiInstruction";
import { CLUSTERING_SIZE } from "../constants/kMeansConstants";
import { MessageContext } from "../context/MessageContext";
import { ClusterPrompt } from "../constants/messageConstants";
import { streamOpenAI } from "../services/openai";
import { ClusterList } from "../constants/surveyConstants";
import { v4 as uuidv4 } from "uuid";
import CheckboxList from "../components/molecules/CheckboxList";
import Map3dViewer from "../components/organisms/Map3dViewer";
import { MapQueryContext } from "../context/MapQueryContext";
import useFeatureFromMap from "../hooks/useFeatureFromMap";
import Colorbox from "../components/atoms/Colorbox";
import useNameFromMap from "../hooks/useNameFromMap";
import BarChartList from "../components/molecules/BarChartList";
import useMapSelectEffect from "../hooks/useMapSelectEffect";
import useMap3dSetViewOnClick from "../hooks/useMap3dSetViewOnClick";
import {
  GEOID,
  OUTLINE_LAYER_SELECT,
  THICK_LINE_WEIGHT_SELECT,
  TRACTS_SOURCE,
} from "../constants/mapConstants";
import { Section } from "../constants/sectionConstants";

/**
 * Cluster page component which consists of three clustering sub-sections.
 */
export default function ClusterPage() {
  const { survey, getClusterSurvey, setClusterSurvey } =
    useContext(SurveyContext);
  const {
    mapViewer,
    mapMode,
    parentLayer,
    layers,
    setLayers,
    geoIdDictSet,
    setGeoIdDictSet,
  } = useContext(MapContext);
  const { messages } = useContext(MessageContext);
  const {
    selectedCluster,
    setSelectedCluster,
    selectedClusterInfo,
    setSelectedClusterInfo,
    selectedGeoId,
    setSelectedGeoId,
  } = useContext(MapQueryContext);

  const [prompts, setPrompts] = useState<ClusterPrompt[]>(
    Array(3).fill(undefined)
  );
  const { clusterId } = useParams<string>()!;
  const clusterIndex = parseInt(clusterId!) - 1;
  const location = useLocation();
  const clusterName = `cluster${clusterId}` as ClusterList["name"];
  const clusterList = survey[clusterName]!;
  const section = utils.pathToSection(location.pathname);

  const { currentSelectedFeature } = useFeatureFromMap(clusterId!);
  const { selectedCountyName, selectedNeighborhoodName } = useNameFromMap();

  // Set OpenAI instruction and map select effect.
  useOpenaiInstruction(parseInt(clusterId!), [
    `${survey.preference.list[clusterIndex * CLUSTERING_SIZE].category}`,
    `${survey.preference.list[clusterIndex * CLUSTERING_SIZE + 1].category}`,
  ]);
  useMapSelectEffect(parentLayer, mapViewer, true);
  useMap3dSetViewOnClick();

  // // Restore mapping layers from session storage.
  // useEffect(() => {
  //   if (
  //     !mapViewer ||
  //     !layers[section] ||
  //     !sources[section] ||
  //     mapViewer.getLayer(section)
  //   ) {
  //     return;
  //   }
  //   mapbox.restoreLayer(layers[section], sources[section], mapViewer);
  // }, [section, mapViewer]);

  useEffect(() => {
    if (!geoJson || !mapViewer) return;

    // Get attributes selected by users.
    const startIndex = CLUSTERING_SIZE * (parseInt(clusterId!) - 1);
    const endIndex = CLUSTERING_SIZE * parseInt(clusterId!);
    const selectedAttributes: HealthcareProperties[] = [];

    for (let i = startIndex, n = endIndex; i < n; i++) {
      if (survey.preference.list.length - 1 < i) break;
      survey.preference.list[i].subCategories.forEach((subCategory) => {
        selectedAttributes.push(subCategory.name);
      });
    }

    // Set cluster list based on the selected attributes.
    const data: number[][] = kmeans.processData(geoJson!, selectedAttributes);
    const kMeansResult: KMeansResult = kmeans.runKMeans(data);
    kmeans.assignToGeoJson(
      geoJson,
      kMeansResult,
      ("cluster" + clusterId!) as Section
    );
    const geoIdDict = kmeans.getGeoJsonClusterProps(geoJson!);
    const newClusterList: ClusterList = {
      name: clusterName,
      list: clusterList.list,
      colors: clusterList.colors,
      geoIdDict,
      attributes: selectedAttributes,
      kMeansResult,
    };

    // Add cluster layer to the map.
    mapbox.addClusterLayer(newClusterList, TRACTS_SOURCE, mapViewer!);
    mapbox.setLayerSettings(section, mapViewer);
    // setLayers((prev) => ({ ...prev, [section]: layer }));
    // setSources((prev) => ({
    //   ...prev,
    //   [section]: source,
    // }));

    // Prepare prompt for OpenAI to trigger AI response.
    newClusterList.list.forEach((item, i) => {
      item.centroids = selectedAttributes.map((attr, j) => ({
        name: attr,
        value: newClusterList.kMeansResult!.centroids[i][j],
        id: uuidv4(),
      }));
    });
    const prompt: ClusterPrompt = {
      type: "cluster",
      content: newClusterList.list.map((item) => ({
        name: item.name,
        centroids: item.centroids,
      })),
    };
    setPrompts((prev) =>
      prev.map((item, i) => (i === clusterIndex ? prompt : item))
    );
    setClusterSurvey(clusterId!, newClusterList);
  }, [location.pathname, geoJson, mapViewer]);

  // Reflect user selection on cluster list to the map and props.
  useEffect(() => {
    if (!mapViewer || !geoJson) return;

    mapbox.updateClusterLayer(clusterId!, clusterList, mapViewer);
    kmeans.applySelectionProps(geoJson, clusterList);
    setGeoIdDictSet((prev) => ({
      ...prev,
      [clusterId!]: clusterList.geoIdDict,
    }));
  }, [clusterList, mapViewer, geoJson]);

  // Restore mapping on mapMode change
  useEffectAfterMount(() => {
    if (!mapViewer) return;

    const onStyleLoad = () => {
      // Restore current cluster layer.
      mapbox.restoreLayer(layers[section], geoJsons[section], mapViewer);
      mapbox.setLayerSettings(section, mapViewer);
      mapbox.updateClusterLayer(clusterId!, clusterList, mapViewer);

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

  // Turn off Legend section on leaving current url.
  useEffect(() => {
    return () => {
      setSelectedCluster(undefined);
      setSelectedClusterInfo(undefined);
      setSelectedGeoId(undefined);
    };
  }, [location.pathname]);

  return (
    <>
      <Sidebar>
        <SidebarSection>
          <AIResponseList
            surveyName={clusterName}
            list={clusterList.list}
            listType={CheckboxList}
            colors={clusterList.colors}
            prompt={prompts[clusterIndex]}
            streamOpenAI={() =>
              streamOpenAI(
                prompts[clusterIndex],
                messages[section],
                survey.preference.list,
                clusterIndex
              )
            }
            showInfo
            setInfo={setSelectedClusterInfo}
          />
        </SidebarSection>
      </Sidebar>

      {/* Legend for 3d preview */}
      <LegendSection
        title={`${selectedNeighborhoodName}, ${selectedCountyName}`}
        visible={selectedCluster !== undefined}
        onClose={() => {
          setSelectedCluster(undefined);
          setSelectedGeoId(undefined);
        }}
        onOpen={() => setSelectedClusterInfo(undefined)}
      >
        <Map3dViewer visible={selectedCluster !== undefined} />
        {currentSelectedFeature && (
          <div style={{ marginTop: "1rem" }}>
            <Colorbox
              label={currentSelectedFeature.name}
              color={currentSelectedFeature.color}
              fontSize="1rem"
              fontWeight="var(--font-bold)"
            />
            <p style={{ margin: 0 }}>{currentSelectedFeature.content}</p>
          </div>
        )}
      </LegendSection>

      {/* Legend for cluster information */}
      {selectedClusterInfo !== undefined && (
        <LegendSection
          title={clusterList.list[selectedClusterInfo].name}
          titleColor={clusterList.list[selectedClusterInfo].color}
          visible={selectedClusterInfo !== undefined}
          onClose={() => {
            setSelectedClusterInfo(undefined);
            setSelectedGeoId(undefined);
          }}
          onOpen={() => {
            setSelectedCluster(undefined);
            setSelectedGeoId(undefined);
          }}
        >
          <p style={{ margin: 0 }}>
            {clusterList.list[selectedClusterInfo].content}
          </p>
          <BarChartList
            list={clusterList.list[selectedClusterInfo].centroids}
          />
        </LegendSection>
      )}

      <PopupSection>
        <PopupContentCluster clusterId={clusterId!} />
      </PopupSection>
    </>
  );
}
