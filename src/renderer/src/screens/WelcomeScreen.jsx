import { useAppStore } from "../store";
import { useState } from 'react'

// Sets the maximum distance in pixels from the bottom of the Terms & Conditions
// from which point we consider the TnC acceptable.
const MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE = 32;

function WelcomeScreen({ config }) {
    const acceptTermsAndConditions = useAppStore(store => store.acceptTermsAndConditions);
    const quit = useAppStore(store => store.quit);

    const termsAndConditionsHtml = config.data.messages.terms_and_conditions;

    const [reachedBottom, setReachedBottom] = useState(false);

    // scroll handler to know the user has seen the TnC
    const handleScrollOfTnc = (e) => {
        const bottomDistance = (e.target.scrollHeight - e.target.scrollTop) - e.target.clientHeight;
        const hasNowReachedBottom = bottomDistance < MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE;
        // const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (hasNowReachedBottom) {
            setReachedBottom(true);
         }
    };

    return (
        <div className="WelcomeScreen appScreen">
            <div className="termsAndConditions">
                <h4>Terms and conditions</h4>
            </div>

            <div className="termsAndConditions termsAndConditionsText" onScroll={handleScrollOfTnc}>
                <div className="fromConfig" dangerouslySetInnerHTML={{ __html: termsAndConditionsHtml }}/>
            </div>

            <div className="buttonRow buttonRow2">
                <div className="quitButton">
                    <button className="bigButton" onClick={quit}>Quit the application</button>
                </div>
                <div className="acceptButton">
                    <button className="bigButton" disabled={!reachedBottom} onClick={acceptTermsAndConditions}>Agree to terms of use (WIP)</button>
                </div>
            </div>
        </div>
    );
}

export default WelcomeScreen;