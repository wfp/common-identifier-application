// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { useAppStore } from '../store';
import type { BaseAppState } from '../store';
import { useState, useRef } from 'react';
import BottomButtons from '../components/BottomButtons';
import { useTranslation } from 'react-i18next';
import LanguageSelect from '../components/LanguageSelect';

// Sets the maximum distance in pixels from the bottom of the Terms & Conditions
// from which point we consider the TnC acceptable.
const MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE = 32;

function WelcomeScreen({ config }: { config: BaseAppState["config"]}) {
  const { t } = useTranslation();
  const acceptTermsAndConditions = useAppStore(
    (store) => store.acceptTermsAndConditions,
  );
  const quit = useAppStore((store) => store.quit);

  const termsAndConditionsHtml = config.data.messages!.terms_and_conditions;

  // We'll do an initial, defered check on first render, and we only want to do it once
  const [hadInitialBottomCheckTriggered, setHadInitialBottomCheckTriggered] =
    useState(false);

  // The Terms and conditions can only be accepted if the user has reached the bottom
  const [reachedBottom, setReachedBottom] = useState(false);

  // The ref to the terms and conditions div (used by the initial check)
  const termsAndConditionsDivRef = useRef(null);

  // Returns true if the scrolling in the DOM element has reached its bottom (with a threshold)
  function checkIfReachedBottom(domElement: HTMLElement, threshold: number) {
    const bottomDistance =
      domElement.scrollHeight - domElement.scrollTop - domElement.clientHeight;
    return bottomDistance < threshold;
  }

  // Check if scrolling of TnC has reached its bottom and set the readchedBottom flag if yes
  function checkAndSetIfReachedBottom(
    domElement: HTMLElement,
    threshold = MAX_DISTANCE_FROM_BOTTOM_FOR_TOC_ACCEPTANCE,
  ) {
    if (checkIfReachedBottom(domElement, threshold)) {
      setReachedBottom(true);
    }
  }

  // scroll handler to know the user has seen the TnC
  const handleScrollOfTnc = (e: React.UIEvent<HTMLElement>) => {
    checkAndSetIfReachedBottom(e.currentTarget);
  };

  // The initial check needs to be defered
  if (!hadInitialBottomCheckTriggered) {
    // do not re-dispatch on potential future renders
    setHadInitialBottomCheckTriggered(true);
    // defer after the render
    setTimeout(() => {
      if (termsAndConditionsDivRef.current) checkAndSetIfReachedBottom(termsAndConditionsDivRef.current);
    }, 1);
  }

  return (
    <div className="WelcomeScreen">
      <LanguageSelect />
      <h4 className="titleText">{t("terms title")}</h4>

      <div
        className="textContainer"
        onScroll={handleScrollOfTnc}
        ref={termsAndConditionsDivRef}
      >
        <div
          className="textFromConfig"
          dangerouslySetInnerHTML={{ __html: termsAndConditionsHtml }}
        />
      </div>

      <BottomButtons
        l_onClick={quit}
        l_disabled={false}
        r_onClick={acceptTermsAndConditions}
        r_disabled={!reachedBottom}
        l_content={t("terms leftButton")}
        r_content={t("terms rightButton")}
      />
    </div>
  );
}

export default WelcomeScreen;
