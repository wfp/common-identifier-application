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
import ErrorWrapper from '../components/ErrorWrapper';
import type { ILoadConfigFailed } from '../types';

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
