import { useContext, useEffect, useState } from "react";
import styles from "./PopupSection.module.css";
import { MapContext } from "../../context/MapContext";
import { FOOTBAR_HEIGHT } from "./Footbar";
import { RGBA, POPUP } from "../../constants/mapConstants";
import { isTransparent } from "../../utils/utils";
import { MapQueryContext } from "../../context/MapQueryContext";
import { TractProperties } from "../../constants/geoJsonConstants";
import { isActiveFeature } from "../../services/mapbox";

type Coordinate = {
  x: number;
  y: number;
};
type PopupSectionProps = {
  children: React.ReactNode;
};

/**
 * Container component for the map popup.
 */
export default function PopupSection({ children }: PopupSectionProps) {
  const { mapViewer, parentLayer } = useContext(MapContext);
  const { setHoveredProperty, setSelectedProperty } =
    useContext(MapQueryContext);
  const [position, setPosition] = useState<Coordinate>({ x: 0, y: 0 });
  const [display, setDisplay] = useState<"block" | "none">("none");

  // Set properties based on the map mouse event.
  useEffect(() => {
    if (!mapViewer) return;
    const updateHoveredProperties = (event: mapboxgl.MapMouseEvent) => {
      if (!isActiveFeature(parentLayer, event, mapViewer)) {
        return;
      }
      const feature = mapViewer.queryRenderedFeatures(event.point, {
        layers: [parentLayer],
      })[0];
      setHoveredProperty(feature.properties as TractProperties);
    };

    const updateSelectedProperties = (event: mapboxgl.MapMouseEvent) => {
      if (!isActiveFeature(parentLayer, event, mapViewer)) {
        return;
      }
      const feature = mapViewer.queryRenderedFeatures(event.point, {
        layers: [parentLayer],
      })[0];
      setSelectedProperty(feature.properties as TractProperties);
    };

    mapViewer.on("mousemove", parentLayer, updateHoveredProperties);
    mapViewer.on("click", parentLayer, updateSelectedProperties);

    return () => {
      mapViewer.off("mousemove", parentLayer, updateHoveredProperties);
      mapViewer.off("click", parentLayer, updateSelectedProperties);
    };
  }, [mapViewer, parentLayer, setHoveredProperty, setSelectedProperty]);

  // Set popup status & position based on the map mouse event.
  useEffect(() => {
    if (!mapViewer) return;

    const showPopup = () => {
      setDisplay("block");
    };

    const hidePopup = () => {
      setHoveredProperty(undefined);
      setDisplay("none");
    };

    const updatePopupPosition = (event: mapboxgl.MapMouseEvent) => {
      const mapWidth = window.innerWidth;
      const translate = { x: 0, y: 0 };

      // Skip features with white fill color (non-selected features).
      const feature = mapViewer!.queryRenderedFeatures(event.point, {
        layers: [parentLayer],
      })[0];
      const fillColor = (feature.layer!.paint as { "fill-color": RGBA })[
        "fill-color"
      ];

      if (isTransparent(fillColor)) {
        hidePopup();
        return;
      }
      showPopup();

      // Set X position of the popup.
      if (event.point.x + POPUP.width + POPUP.offset > mapWidth) {
        translate.x = event.point.x - POPUP.width - POPUP.offset;
      } else {
        translate.x = event.point.x + POPUP.offset;
      }
      // Set Y position of the popup.
      if (
        event.point.y + POPUP.height - POPUP.offset >
        window.innerHeight - FOOTBAR_HEIGHT
      ) {
        translate.y = event.point.y - POPUP.height + POPUP.offset;
      } else {
        translate.y = event.point.y - POPUP.offset;
      }
      setPosition({ x: translate.x, y: translate.y });
    };

    mapViewer.on("mousemove", parentLayer, updatePopupPosition);
    mapViewer.on("mouseleave", parentLayer, hidePopup);

    return () => {
      mapViewer.off("mousemove", parentLayer, updatePopupPosition);
      mapViewer.off("mouseleave", parentLayer, hidePopup);
    };
  }, [mapViewer, parentLayer]);

  return (
    <div
      className={styles.container}
      style={{
        display: display,
        maxWidth: POPUP.width,
        maxHeight: POPUP.height,
        left: position.x,
        top: position.y,
      }}
    >
      {children}
    </div>
  );
}
