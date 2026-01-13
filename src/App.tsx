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
import { Suspense, type ComponentType } from 'react';

import { SCREENS } from '../common/screens';

import Boot from './screens/Boot';
import MainScreen from './screens/MainScreen';
import ValidationSuccess from './screens/ValidationSuccess';
import ValidationFailed from './screens/ValidationFailed';
import FileLoading from './screens/FileLoading';
import ProcessingInProgress from './screens/ProcessingInProgress';
import ProcessingFinished from './screens/ProcessingFinished';
import ConfigChange from './screens/ConfigChange';
import LoadNewConfig from './screens/LoadNewConfig';
import ErrorScreen from './screens/Error';
import ConfigUpdated from './screens/ConfigUpdated';
import ProcessingCancelled from './screens/ProcessingCancelled';
import InvalidConfig from './screens/InvalidConfig';
import WelcomeScreen from './screens/WelcomeScreen';
import Navbar from './components/Navbar';
import ProcessingSummary from './screens/ProcessingSummary';

import { useAppStore, useConfig, useScreen } from './store';

function App() {
 
  const screenType = useScreen();
  // const screenType: SCREENS = SCREENS.PROCESSING_SUMMARY as SCREENS; // TEMP
  const config = useConfig();

  const ScreenMap: Record<SCREENS, ComponentType<any>> = {  
    [SCREENS.ERROR]: ErrorScreen,
    [SCREENS.BOOT]: Boot,
    [SCREENS.WELCOME]: WelcomeScreen,
    [SCREENS.MAIN]: MainScreen,
    [SCREENS.INVALID_CONFIG]: InvalidConfig,
    [SCREENS.LOAD_NEW_CONFIG]: LoadNewConfig,
    [SCREENS.CONFIG_CHANGE]: ConfigChange,
    [SCREENS.CONFIG_UPDATED]: ConfigUpdated,
    [SCREENS.FILE_LOADING]: FileLoading,
    [SCREENS.VALIDATION_SUCCESS]: ValidationSuccess,
    [SCREENS.VALIDATION_FAILED]: ValidationFailed,
    [SCREENS.PROCESSING_IN_PROGRESS]: ProcessingInProgress,
    [SCREENS.PROCESSING_FINISHED]: ProcessingFinished,
    [SCREENS.PROCESSING_CANCELLED]: ProcessingCancelled,
    [SCREENS.PROCESSING_SUMMARY]: ProcessingSummary,
  }

  const Screen = ScreenMap[screenType];

  if (screenType === SCREENS.BOOT) {
    return <Boot />;
  }
  
  return (
    <>
      <Navbar config={config} screen={screenType} />
      <Suspense fallback={null}>
        <Screen />
      </Suspense>
    </>
  );
}

export default App;
