import { SCREEN_FILE_LOADING, SCREEN_MAIN, SCREEN_ERROR, useAppStore } from "../store";
import VersionInfo from "./VersionInfo";

// returns a navbar based on the name of the screen
function Navbar({ config, screenType }) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    console.log({ screenType })

    let backButton;

    switch (screenType) {
        // Some screens dont need the back button
        case SCREEN_ERROR:
        case SCREEN_FILE_LOADING:
        case SCREEN_MAIN:
            backButton = (<></>);
            break;
        default:
            backButton = (<a href="#" onClick={backToMainScreen}>&larr; Back to the main screen</a>);
    }

    // if we're on the initial configuration (meaning we don't have a valid config or salt)
    // don't show the back button
    if (config.isInitial) {
        backButton = (<></>);
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