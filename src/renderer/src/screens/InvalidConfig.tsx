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

import { useAppStore } from '../store.js';
import ErrorWrapper from '../components/ErrorWrapper.jsx';
import type { ILoadConfigFailed } from '../types.js';

function InvalidConfig({ config, errorMessage }: Omit<ILoadConfigFailed, "screen"|"isRuntimeError">) {
  const loadNewConfig = useAppStore((store) => store.loadNewConfig);

  return (
    <div className="error-screen InvalidConfig appScreen">
      <div className="help">
        <h3 className="titleText">Configuration error</h3>
        <ErrorWrapper
          config={config}
          isRuntimeError={false}
          errorMessage={errorMessage}
        />
      </div>

      <div className="cid-button-row">
        <button
          className="cid-button cid-button-lg cid-button-alert"
          onClick={loadNewConfig}
        >
          <span className="icon">⚙</span> Update the configuration from a file
        </button>
      </div>

      <div className="developerInformation">
        <h4>Technical Details</h4>
        <code>{errorMessage}</code>
      </div>
    </div>
  );
}

export default InvalidConfig;
