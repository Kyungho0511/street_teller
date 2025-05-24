import styles from "./SelectableList.module.css";
import { useEffect, useRef, useState } from "react";
import { HealthcareProperties } from "../../constants/geoJsonConstants";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";

type SelectableListProps = {
  list: { name: HealthcareProperties; id: string }[];
  onSelectItem?: (item: HealthcareProperties) => void;
};

/**
 * List component with selectable items associated with mapping.
 * @param list - List of items to be displayed.
 * @param onSelectItem - Callback function to be called when an item is selected.
 */
export default function SelectableList({
  list,
  onSelectItem,
}: SelectableListProps) {
  const [selectedItem, setSelectedItem] = useState<HealthcareProperties>(
    list[0].name
  );

  useEffect(() => {
    setSelectedItem(list[0].name);
  }, [list]);

  useEffectAfterMount(() => {
    onSelectItem && onSelectItem(selectedItem);
  }, [selectedItem]);

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleClick = (
    event: React.MouseEvent<HTMLLIElement>,
    index: number
  ) => {
    // Highlight the selected item.
    const target = event.currentTarget as HTMLLIElement;
    itemRefs.current.forEach((item) => item?.classList.remove(styles.selected));
    target.classList.add(styles.selected);

    // Update the selected item.
    setSelectedItem(list[index].name);
  };

  return (
    <ul className={styles.list}>
      {list.map((item, index) => (
        <li
          ref={(element) => (itemRefs.current[index] = element)}
          className={`${styles.item} ${
            item.name === selectedItem && styles.selected
          }`}
          key={item.id}
          onClick={(event) => handleClick(event, index)}
        >
          <p className={styles.text}>{item.name}</p>
        </li>
      ))}
    </ul>
  );
}
