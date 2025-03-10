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

enum HANDLERS {
  NONE = 0,
  LOAD_NEW_CONFIG,
  REMOVE_USER_CONFIG,
}

export default function ConfigChange() {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);
  const loadNewConfig = useAppStore((store) => store.loadNewConfig);
  const removeUserConfig = useAppStore((store) => store.removeUserConfig);

  const [handler, setHandler] = useState<HANDLERS>(HANDLERS.NONE);

  // Returns a function that will set the handler to the provided value
  function setHandlerOnClick(newHandler: HANDLERS) {
    return () => setHandler(newHandler);
  }

  switch (handler) {
    case HANDLERS.LOAD_NEW_CONFIG: {
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

    case HANDLERS.REMOVE_USER_CONFIG: {
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
              onClick={setHandlerOnClick(HANDLERS.LOAD_NEW_CONFIG)}
            >
              Load a new configuration file
            </button>
            <div className="cid-button-with-helptext">
              <button
                className="cid-button cid-button-lg cid-button-secondary"
                onClick={setHandlerOnClick(HANDLERS.REMOVE_USER_CONFIG)}
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
