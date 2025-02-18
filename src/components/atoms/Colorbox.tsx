import { RGBA } from "../../constants/mapConstants";
import { rgbaToString } from "../../utils/utils";
import styles from "./Colorbox.module.css";

type ColorboxProps = {
  label: string;
  color?: RGBA;
  fontSize?: string;
  fontWeight?: string;
};

/**
 * Colorbox component to display the color and label of clusters.
 */
export default function Colorbox({
  label,
  color,
  fontSize,
  fontWeight,
}: ColorboxProps) {
  return (
    <div className={styles.container}>
      <div
        className={styles.colorbox}
        style={color && { backgroundColor: rgbaToString(color) }}
      ></div>
      <p className={styles.text} style={{ fontSize, fontWeight }}>
        {label}
      </p>
    </div>
  );
}
