/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import { useTranslation } from "react-i18next";
import BottomButtons from "../components/BottomButtons";
import { useState } from "react";
import { updateUserData } from "../store/actions/config.action";
import { useAppStore } from "../store";

export const InputUserData = () => {
  const { t } = useTranslation();
  const encryptionEnabled = useAppStore(s => !!s.config.data.post_processing?.encryption) || false;
  const userDataFromStore = useAppStore(s => s.userData );

  const [userData, setUserData] = useState({
    signingKey: userDataFromStore?.signingKey ?? "",
    language: userDataFromStore?.language ?? "english",
  });

  const sanitiseInput = (value: string) => {
    return value.trim().replace(/<[^>]*>?/gm, ''); 
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    const cleanValue = sanitiseInput(value);
    setUserData({ ...userData, [name]: cleanValue }); 
  }


  return (
    <div className="input-user-data">
      <h2 className="titleText">{t("inputUserData title")}</h2>
      
      {/*
        User input options:
         - Language select option
          - Signing key input
          - UI options (theme selection)
      */}
      <form className="user-data-form">
        <label htmlFor="language">{t("inputUserData languageLabel")}</label>
        <div className="tooltip-wrapper">
          <select name="language" id="language" value={userData.language} onChange={handleInputChange} disabled={true}>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="arabic">Arabic</option>
          </select>
          <span id="language-tooltip" className="tooltip-text" role="tooltip">{t("inputUserData languageTooltip")}</span>
        </div>

        <label htmlFor="signingKey">{t("inputUserData signingKeyLabel")}</label>
        <div className="tooltip-wrapper">
          <input type="text" id="signingKey" name="signingKey" value={userData.signingKey} onChange={handleInputChange} disabled={!encryptionEnabled} />
          <span id="signingKey-tooltip" className="tooltip-text" role="tooltip">{t("inputUserData signingKeyTooltip")}</span>
        </div>
      </form>
      <BottomButtons side="right" r_content="Next" r_onClick={() => {
        const finalData = { ...userData, signingKey: userData.signingKey.trim() }; // double check
        updateUserData(finalData);
      }} />

    </div>
  );
}

export default InputUserData;