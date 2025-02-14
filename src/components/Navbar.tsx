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

import { useAppStore, SCREENS } from '../store';
import VersionInfo from './VersionInfo';
import type { BaseAppState } from '../store';

// returns a navbar based on the name of the screen
function Navbar({ config, screen }: BaseAppState) {
  const backToMainScreen = useAppStore((store) => store.backToMainScreen);

  let backButton;

  switch (screen) {
    // Some screens dont need the back button
    case SCREENS.ERROR:
    case SCREENS.PROCESSING_CANCELLED:
    case SCREENS.LOAD_NEW_CONFIG:
    case SCREENS.FILE_LOADING:
    case SCREENS.CONFIG_UPDATED:
    case SCREENS.MAIN:
      backButton = <></>;
      break;
    default:
      backButton = (
        <a href="#" onClick={backToMainScreen}>
          &larr; Back to the main screen
        </a>
      );
  }

  // if we're on the initial configuration (meaning we don't have a valid config or salt)
  // don't show the back button
  if (config.isInitial) {
    backButton = <></>;
  }

  return (
    <div className="main-navigation">
      <div className="back-button">{backButton}</div>

      <VersionInfo config={config} />
    </div>
  );
}

export default Navbar;
