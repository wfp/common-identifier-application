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

import { useAppStore } from '../store';
import ErrorWrapper from '../components/ErrorWrapper';
import type { ILoadConfigFailed } from '../types';

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

      <div className="developerInformation">
        <h4>Technical Details</h4>
        <code>{errorMessage}</code>
      </div>
    </div>
  );
}

export default Error;
