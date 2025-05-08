import styles from "./Footbar.module.css";
import { Link, useLocation } from "react-router-dom";
import Button from "../atoms/Button";
import PromptBox from "../molecules/PromptBox";
import MapToggleButton from "../atoms/MapToggleButton";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { useContext, useState } from "react";
import { NavbarContext } from "../../context/NavbarContext";
import MapControls from "./MapControls";
import useEffectAfterMount from "../../hooks/useEffectAfterMount";

export const FOOTBAR_HEIGHT = 90;

/**
 * Footbar component.
 */
export default function Footbar() {
  const { isSidebarOpen } = useContext(NavbarContext);

  // Router navigation logic
  const location = useLocation();

  const [navButtonVisible, setNavButtonVisible] = useState(
    () => location.pathname !== "/cluster/3"
  );
  useEffectAfterMount(() => {
    setNavButtonVisible(location.pathname !== "/cluster/3");
  }, [location.pathname]);

  let nextPath = "/";

  switch (location.pathname) {
    case "/":
      nextPath = "/cluster/1";
      break;
    case "/cluster/1":
      nextPath = "/cluster/2";
      break;
    case "/cluster/2":
      nextPath = "/cluster/3";
      break;
    // case "/cluster/3":
    //   nextPath = "/report";
    //   break;
  }

  return (
    <footer
      className={styles.footer}
      style={
        isSidebarOpen
          ? {
              width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
              height: FOOTBAR_HEIGHT,
              left: SIDEBAR_WIDTH,
            }
          : {
              width: `100%`,
              height: FOOTBAR_HEIGHT,
              left: 0,
            }
      }
    >
      <MapToggleButton />
      <PromptBox />
      <Link to={nextPath}>
        {navButtonVisible && <Button text={"continue"} type="footbar" />}
      </Link>
      <MapControls />
    </footer>
  );
}
