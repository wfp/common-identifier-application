import { useState } from "react";
import { useAppStore } from "../store";


const NO_HANDLER = "noHandler";
const LOAD_NEW_CONFIG = "loadNewConfig";
const REMOVE_USER_CONFIG = "removeUserConfig";

export default function ConfigChange() {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);
    const loadNewConfig = useAppStore(store => store.loadNewConfig);
    const removeUserConfig =  useAppStore((store) => store.removeUserConfig);


    const [handler, setHandler] = useState(NO_HANDLER);

    // Returns a function that will set the handler to the provided value
    function setHandlerOnClick(newHandler) {
        return () => {
            setHandler(newHandler);
        }
    }

    // the contents of the page
    let contents = [];

    switch (handler) {
        case LOAD_NEW_CONFIG: {
            return (
                <div className="ConfigChange appScreen loadNewConfig">
                    <div className="helpText">
                        <h4>Use the default configuration</h4>
                        <p>Are you sure you want to load a new configiuration from a file?</p>
                    </div>

                    <div className="buttonRow buttonRow2">
                        <div className="cancelButton">
                            <button className="bigButton" onClick={backToMainScreen}>Cancel</button>
                        </div>
                        <div className="okButton">
                            <button className="bigButton" onClick={loadNewConfig}>Load a new Configuration</button>
                        </div>
                    </div>

                </div>
            );
        }

        case REMOVE_USER_CONFIG: {
            return (
                <div className="ConfigChange appScreen removeUserConfig">
                    <div className="helpText">
                        <h4>Use the default configuration</h4>
                        <p>Are you sure you want to use the default configuration?</p>
                    </div>

                    <div className="buttonRow buttonRow2">
                        <div className="cancelButton">
                            <button className="bigButton" onClick={backToMainScreen}>Cancel</button>
                        </div>
                        <div className="okButton">
                            <button className="bigButton" onClick={removeUserConfig}>Use the default configuration</button>
                        </div>
                    </div>

                </div>
            );
        }

        // The default when no handlers are set
        default: {
            return (
                <div className="ConfigChange appScreen">
                    <div className="title">
                        <h3>Update configuration</h3>
                    </div>

                    <div className="buttonRow buttonRow1">
                        <div className="loadNewConfigButton">
                            <button className="bigButton" onClick={setHandlerOnClick(LOAD_NEW_CONFIG)}>Load a new Configuration</button>
                        </div>
                    </div>

                    <div className="helpText">
                        <p>Load a new configuration from a file you received</p>
                    </div>

                    <div className="buttonRow buttonRow1">
                        <div className="useDefaultConfigButton">
                            <button className="bigButton" onClick={setHandlerOnClick(REMOVE_USER_CONFIG)}>Use the default configuration</button>
                        </div>
                    </div>

                    <div className="helpText">
                        <p>Fall back to the default (built-in) configuration that shipped with the application.</p>
                    </div>

                </div>
            );
        }
    }




    // return (
    //     <div className="ConfigChange appScreen">
    //         <div className="helpText">
    //             Load a new configuration
    //         </div>

    //         <div className="buttonRow buttonRow1">
    //             <div className="loadNewConfigButton">
    //                 <button className="bigButton" onClick={loadNewConfig}>Load a new Configuration</button>
    //             </div>
    //         </div>

    //         <div className="helpText">
    //             Fall back to the default (built-in) configuration
    //         </div>

    //         <div className="buttonRow buttonRow1">
    //             <div className="useDefaultConfigButton">
    //                 <button className="bigButton" onClick={removeUserConfig}>Use the default configuration</button>
    //             </div>
    //         </div>
    //     </div>
    // )
}
