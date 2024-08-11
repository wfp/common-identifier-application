import { SCREEN_FILE_LOADING, SCREEN_MAIN, useAppStore } from "../store";
import VersionInfo from "./VersionInfo";

// returns a navbar based on the name of the screen
function Navbar({config, screenType}) {
  const backToMainScreen = useAppStore(store => store.backToMainScreen);

  console.log({screenType})

  let backButton;

  switch (screenType) {
    // Some screens dont need the back button
    // case SCREEN_MAIN:
    case SCREEN_FILE_LOADING:
        backButton = (<></>);
        break;
    default:
        backButton = (<a href="#" onClick={backToMainScreen}>&larr; Back to the main screen</a>);
  }

  return (
      <div className="Navbar">
        <div className="backButton">
          {backButton}
        </div>

        <VersionInfo config={config} />
      </div>
  )
}

export default Navbar;