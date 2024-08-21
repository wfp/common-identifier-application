import { useAppStore } from "../store";

function WelcomeScreen({ config }) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    console.log("Welcome", config);

    // const termsAndConditionsHtml = "<div class='asd'>Hello <b>WORLD</b></div>";
    const termsAndConditionsHtml = config.data.meta.terms_and_conditions;

    return (
        <div className="WelcomeScreen appScreen">
            <div className="termsAndConditions">
                <h4>Terms and conditions</h4>

                <div className="fromConfig" dangerouslySetInnerHTML={{ __html: termsAndConditionsHtml }} />
            </div>

            <div className="buttonRow buttonRow1">
                <div className="acceptButton">
                    <button className="bigButton" onClick={backToMainScreen}>Agree to terms of use (WIP)</button>
                </div>
            </div>
        </div>
    );
}

export default WelcomeScreen;