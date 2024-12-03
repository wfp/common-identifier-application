/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { useState } from 'react';
import { useAppStore } from '../store';

const NO_HANDLER = 'noHandler';
const LOAD_NEW_CONFIG = 'loadNewConfig';
const REMOVE_USER_CONFIG = 'removeUserConfig';

export default function ConfigChange() {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);
  const loadNewConfig = useAppStore((store) => store.loadNewConfig);
  const removeUserConfig = useAppStore((store) => store.removeUserConfig);

  const [handler, setHandler] = useState(NO_HANDLER);

  // Returns a function that will set the handler to the provided value
  function setHandlerOnClick(newHandler) {
    return () => {
      setHandler(newHandler);
    };
  }

  // the contents of the page
  let contents = [];

  switch (handler) {
    case LOAD_NEW_CONFIG: {
      return (
        <div className="config-change appScreen loadNewConfig">
          <h3 className="titleText">Update configuration</h3>

          <p className="descriptionText">
            Are you sure you want to load a new configuration file?
          </p>
          <div className="cid-button-row cid-button-row-horiz">
            <button
              className="cid-button cid-button-lg cid-button-secondary"
              onClick={backToMainScreen}
            >
              Cancel
            </button>
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={loadNewConfig}
            >
              Yes, load a file
            </button>
          </div>
        </div>
      );
    }

    case REMOVE_USER_CONFIG: {
      return (
        <div className="config-change defaultConfig">
          <h3 className="titleText">Update configuration</h3>
          <p className="descriptionText">
            Are you sure you want to use the default configuration?
          </p>

          <div className="cid-button-row cid-button-row-horiz">
            <button
              className="cid-button cid-button-lg cid-button-secondary"
              onClick={backToMainScreen}
            >
              Cancel
            </button>
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={removeUserConfig}
            >
              Yes, use the default
            </button>
          </div>
        </div>
      );
    }

    // The default when no handlers are set
    default: {
      return (
        <div className="config-change">
          <h3 className="titleText">Update configuration</h3>

          <div className="cid-button-row cid-button-row-vert">
            <button
              className="cid-button cid-button-lg cid-button-primary"
              onClick={setHandlerOnClick(LOAD_NEW_CONFIG)}
            >
              Load a new configuration file
            </button>
            <div className="cid-button-with-helptext">
              <button
                className="cid-button cid-button-lg cid-button-secondary"
                onClick={setHandlerOnClick(REMOVE_USER_CONFIG)}
              >
                Use the default configuration
              </button>
              <p className="helptext">
                Revert to the default (built-in) configuration supplied with the
                application
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}
