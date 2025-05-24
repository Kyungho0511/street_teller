import styles from "./BarChart.module.css";
import { UnitType } from "../../constants/mapConstants";
import * as utils from "../../utils/utils";
import { useEffect, useState } from "react";
import { HealthcareProperties } from "../../constants/geoJsonConstants";

type BarChartProps = {
  label: HealthcareProperties;
  value: number;
  unit?: UnitType;
};

/**
 * Bar chart component displaying values with a label.
 */
export default function BarChart({ label, value, unit }: BarChartProps) {
  const [formattedValue, setformattedValue] = useState<string>("");

  // Update the formatted value.
  useEffect(() => {
    if (!unit) return;
    const rawValue = utils.unNormalize(value, label);
    setformattedValue(utils.formatUnit(rawValue, unit));
  }, [value, unit, label]);

  return (
    <div className={styles.container}>
      <p className={styles.text}>
        {label}: {unit ? formattedValue : value}
      </p>
      <div className={styles.background}>
        <div
          className={styles.chart}
          style={{ width: `${Math.round(value * 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
