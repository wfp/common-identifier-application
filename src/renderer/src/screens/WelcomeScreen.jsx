import { useAppStore } from "../store";

function WelcomeScreen({ config }) {
    const acceptTermsAndConditions = useAppStore(store => store.acceptTermsAndConditions);
    const quit = useAppStore(store => store.quit);

    console.log("Welcome", config);

    // const termsAndConditionsHtml = "<div class='asd'>Hello <b>WORLD</b></div>";
    const termsAndConditionsHtml = config.data.meta.terms_and_conditions;

    return (
        <div className="WelcomeScreen appScreen">
            <div className="termsAndConditions">
                <h4>Terms and conditions</h4>
            </div>

            <div className="termsAndConditions termsAndConditionsText">
                <div className="fromConfig" dangerouslySetInnerHTML={{ __html: termsAndConditionsHtml }} />
            </div>

            <div className="buttonRow buttonRow2">
                <div className="quitButton">
                    <button className="bigButton" onClick={quit}>Quit the application</button>
                </div>
                <div className="acceptButton">
                    <button className="bigButton" onClick={acceptTermsAndConditions}>Agree to terms of use (WIP)</button>
                </div>
            </div>
        </div>
    );
}

export default WelcomeScreen;