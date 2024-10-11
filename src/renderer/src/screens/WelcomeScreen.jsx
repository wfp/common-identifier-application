import { useAppStore } from "../store";
import { useState, useRef } from 'react'
import BottomButtons from "../components/BottomButtons";

// Sets the maximum distance in pixels from the bottom of the Terms & Conditions
// from which point we consider the TnC acceptable.
const MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE = 32;

function WelcomeScreen({ config }) {
    const acceptTermsAndConditions = useAppStore(store => store.acceptTermsAndConditions);
    const quit = useAppStore(store => store.quit);

    const termsAndConditionsHtml = config.data.messages.terms_and_conditions;

    // We'll do an initial, defered check on first render, and we only want to do it once
    const [hadInitialBottomCheckTriggered, setHadInitialBottomCheckTriggered] = useState(false);

    // The Terms and conditions can only be accepted if the user has reached the bottom
    const [reachedBottom, setReachedBottom] = useState(false);

    // The ref to the terms and conditions div (used by the initial check)
    const termsAndConditionsDivRef = useRef(null);


    // Returns true if the scrolling in the DOM element has reached its bottom (with a threshold)
    function checkIfReachedBottom(domElement, treshold) {
        const bottomDistance = (domElement.scrollHeight - domElement.scrollTop) - domElement.clientHeight;
        return bottomDistance < treshold;
    }

    // Check if scrolling of TnC has reached its bottom and set the readchedBottom flag if yes
    function checkAndSetIfReachedBottom(domElement, treshold=MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE) {
        if (checkIfReachedBottom(domElement, treshold)) {
            setReachedBottom(true);
        }
    }

    // scroll handler to know the user has seen the TnC
    const handleScrollOfTnc = (e) => {
        checkAndSetIfReachedBottom(e.target);
    };

    // The initial check needs to be defered
    if (!hadInitialBottomCheckTriggered) {
        // do not re-dispatch on potential future renders
        setHadInitialBottomCheckTriggered(true);
        // defer after the render
        setTimeout(() => {
            checkAndSetIfReachedBottom(termsAndConditionsDivRef.current);
        },1);
    }

    return (
        <div className="WelcomeScreen">
            <h4 className="titleText">Terms and conditions</h4>

            <div className="textContainer" onScroll={handleScrollOfTnc} ref={termsAndConditionsDivRef}>
                <div className="textFromConfig" dangerouslySetInnerHTML={{ __html: termsAndConditionsHtml }}/>
            </div>

            <BottomButtons
                l_onClick={quit}
                l_disabled={false}
                r_onClick={acceptTermsAndConditions}
                r_disabled={!reachedBottom}
                l_content="Disagree and quit"
                r_content="Agree to terms of use"
            />
        </div>
    );
}

export default WelcomeScreen;