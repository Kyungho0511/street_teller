import styles from "./CheckboxList.module.css";
import { Boroughs, Preferences } from "../constants/homeConstants";

type CheckboxListProps = {
  name: string;
  list: CheckboxItem[] | Boroughs['list'];
  colorbox?: boolean;
  setSurveyContext?: (newSurveyElement: Boroughs | Preferences) => void;
};

export type CheckboxItem = {
  name: string;
  checked: boolean;
  id: string;
}

export default function CheckboxList({ name, list, colorbox, setSurveyContext }: CheckboxListProps) {

  // Handle uncontrolled checkbox change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {

    // Update Boroughs in the survey context
    if (setSurveyContext) {
      const updatedList = [...list] as Boroughs['list'];
      updatedList[index] = { ...updatedList[index], checked: event.target.checked };

      const newBoroughs: Boroughs = { name: "boroughs", list: updatedList };
      setSurveyContext(newBoroughs);
    }
  }

  return (
    <form className={styles.form}>
      {list.map((item, index) => (
        <label className={styles.label} key={item.id}>
          <input
            className={styles.input}
            type="checkbox"
            name={name}
            value={item.name}
            checked={item.checked}
            onChange={(event) => handleChange(event, index)}
          />
          <span className={styles.indicator}></span>
          <div className={styles.text}>
            {colorbox && <span className={styles.colorbox}></span>}
            {item.name}
          </div>
        </label>
      ))}
    </form>
  );
}
