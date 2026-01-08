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

import { useAppStore, useConfig, useScreen } from './store';

function App() {
  let screen = null;
 
  const screenType = useScreen();
  const config = useConfig();

  const inputFilePath     = useAppStore((s) => s.inputFilePath);
  const outputFilePath    = useAppStore((s) => s.outputFilePath);
  const mappingFilePath   = useAppStore((s) => s.mappingFilePath);
  const errorFilePath     = useAppStore((s) => s.errorFilePath);
  const document          = useAppStore((s) => s.document);
  const isMappingDocument = useAppStore((s) => s.isMappingDocument);
  const errorMessage      = useAppStore((s) => s.errorMessage);
  const isRuntimeError    = useAppStore((s) => s.isRuntimeError);
  
  switch (screenType) {
    case SCREENS.ERROR: {
      screen = (
        <ErrorScreen errorMessage={errorMessage!} isRuntimeError={isRuntimeError!} config={config} />
      );
      break;
    }

    case SCREENS.BOOT: {
      return <Boot />;
    }

    case SCREENS.WELCOME: {
      screen = <WelcomeScreen config={config} />;
      break;
    }

    case SCREENS.MAIN: {
      screen = <MainScreen />;
      break;
    }

    case SCREENS.INVALID_CONFIG: {
      screen = <InvalidConfig errorMessage={errorMessage!} config={config} />;
      break;
    }

    case SCREENS.LOAD_NEW_CONFIG: {
      screen = <LoadNewConfig />;
      break;
    }

    case SCREENS.CONFIG_CHANGE: {
      screen = <ConfigChange />;
      break;
    }

    case SCREENS.CONFIG_UPDATED: {
      screen = <ConfigUpdated config={config} />;
      break;
    }

    case SCREENS.FILE_LOADING: {
      screen = <FileLoading inputFilePath={inputFilePath!} />;
      break;
    }

    case SCREENS.VALIDATION_SUCCESS: {
      screen = (
        <ValidationSuccess
          config={config}
          document={document!}
          inputFilePath={inputFilePath!}
          isMappingDocument={isMappingDocument!}
        />
      );
      break;
    }

    case SCREENS.VALIDATION_FAILED: {
      screen = (
        <ValidationFailed
          config={config}
          document={document!}
          inputFilePath={inputFilePath!}
          errorFilePath={errorFilePath!}
          isMappingDocument={isMappingDocument!}
        />
      );
      break;
    }

    case SCREENS.PROCESSING_IN_PROGRESS: {
      screen = <ProcessingInProgress inputFilePath={inputFilePath} />;
      break;
    }

    case SCREENS.PROCESSING_FINISHED: {
      screen = (
        <ProcessingFinished
          config={config}
          isMappingDocument={isMappingDocument!}
          document={document!}
          outputFilePath={outputFilePath!}
          mappingFilePath={mappingFilePath!}
        />
      );
      break;
    }

    case SCREENS.PROCESSING_CANCELLED: {
      screen = <ProcessingCancelled />;
      break;
    }
  }

  return (
    <>
      <Navbar config={config} screen={screenType} />
      {screen}
    </>
  );
}

export default App;
