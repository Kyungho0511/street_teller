import { FOOTBAR_HEIGHT } from "./Footbar";
import styles from "./LegendSection.module.css";
import { MAP_CONTROLS_HEIGHT } from "./MapControls";
import Icon from "../atoms/Icon";
import { iconPaths } from "../../constants/IconConstants";
import { useState } from "react";

type LegendSectionProps = {
  children: React.ReactNode;
  title: string;
  visible?: boolean;
  onClose?: () => void;
};

/**
 * Container component to display the legend of the current analysis.
 */
export default function LegendSection({
  children,
  title,
  visible = true,
  onClose,
}: LegendSectionProps) {
  return (
    <div
      className={styles.container}
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <div className={styles.header}>
        <div className={styles.header_content}>
          {title && <h4 className={styles.title}>{title}</h4>}
        </div>
        {onClose && (
          <div className={styles.closeButton} onClick={onClose}>
            <Icon path={iconPaths.close} color="var(--color-dark-grey)" />
          </div>
        )}
      </div>
      <div
        className={styles.body}
        style={{
          maxHeight: `calc(100vh - ${
            FOOTBAR_HEIGHT + MAP_CONTROLS_HEIGHT
          }px - 5rem)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
