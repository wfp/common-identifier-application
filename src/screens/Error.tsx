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
import type { ILoadConfigFailed } from '../../common/types';
import type React from 'react';
import { DeveloperInformation } from '../components/DeveloperInformation';

function Error({ config, isRuntimeError, errorMessage }: Omit<ILoadConfigFailed, "screen">) {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);

  return (
    <div className="error-screen">
      <div className="help">
        <h3 className="titleText">ERROR</h3>
        <ErrorWrapper
          config={config}
          errorMessage={errorMessage}
          isRuntimeError={isRuntimeError}
        />
      </div>

      <div className="cid-button-row">
        <button
          className="cid-button cid-button-lg cid-button-alert"
          onClick={backToMainScreen}
        >
          Back to the main screen
        </button>
      </div>

      <DeveloperInformation errorMessage={errorMessage} />
    </div>
  );
}

export default Error;
