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

import { useState } from 'react';
import { useAppStore } from '../store';
import { useTranslation } from 'react-i18next';

enum HANDLERS {
  NONE = 0,
  LOAD_NEW_CONFIG,
  REMOVE_USER_CONFIG,
}

export default function ConfigChange() {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);
  const loadNewConfig = useAppStore((store) => store.loadNewConfig);
  const removeUserConfig = useAppStore((store) => store.removeUserConfig);
    const { t } = useTranslation();

  const [handler, setHandler] = useState<HANDLERS>(HANDLERS.NONE);

  // Returns a function that will set the handler to the provided value
  function setHandlerOnClick(newHandler: HANDLERS) {
    return () => setHandler(newHandler);
  }

  switch (handler) {
    case HANDLERS.LOAD_NEW_CONFIG: {
      return (
        <div className="config-change appScreen loadNewConfig">
          <h3 className="titleText">{t("updateConfig load title")}</h3>

          <p className="descriptionText">
            {t("updateConfig load description")}
          </p>
          <div className="cid-button-row cid-button-row-horiz">
            <button
              className="cid-button cid-button-lg cid-button-secondary"
              onClick={backToMainScreen}
            >
              {t("updateConfig load cancel")}
            </button>
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={loadNewConfig}
            >
              {t("updateConfig load confirm")}
            </button>
          </div>
        </div>
      );
    }

    case HANDLERS.REMOVE_USER_CONFIG: {
      return (
        <div className="config-change defaultConfig">
          <h3 className="titleText">{t("updateConfig default title")}</h3>
          <p className="descriptionText">
            {t("updateConfig default description")}
          </p>

          <div className="cid-button-row cid-button-row-horiz">
            <button
              className="cid-button cid-button-lg cid-button-secondary"
              onClick={backToMainScreen}
            >
              {t("updateConfig default cancel")}
            </button>
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={removeUserConfig}
            >
              {t("updateConfig default confirm")}
            </button>
          </div>
        </div>
      );
    }

    // The default when no handlers are set
    default: {
      return (
        <div className="config-change">
          <h3 className="titleText">{t("updateConfig title")}</h3>

          <div className="cid-button-row cid-button-row-vert">
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={setHandlerOnClick(HANDLERS.LOAD_NEW_CONFIG)}
            >
              {t("updateConfig loadButton")}
            </button>
            <div className="cid-button-with-helptext">
              <button
                className="cid-button cid-button-lg cid-button-secondary"
                onClick={setHandlerOnClick(HANDLERS.REMOVE_USER_CONFIG)}
                >
                {t("updateConfig defaultButton")}
              </button>
              <p className="helptext">
                {t("updateConfig defaultDescription")}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}
