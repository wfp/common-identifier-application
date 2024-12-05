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
import Boot from './screens/Boot.jsx';
import MainScreen from './screens/MainScreen.jsx';
import ValidationSuccess from './screens/ValidationSuccess.jsx';
import ValidationFailed from './screens/ValidationFailed.jsx';
import FileLoading from './screens/FileLoading.jsx';
import ProcessingInProgress from './screens/ProcessingInProgress.jsx';
import ProcessingFinished from './screens/ProcessingFinished.jsx';
import ConfigChange from './screens/ConfigChange.jsx';
import LoadNewConfig from './screens/LoadNewConfig.jsx';
import ErrorScreen from './screens/Error.jsx';
import ConfigUpdated from './screens/ConfigUpdated.jsx';
import ProcessingCancelled from './screens/ProcessingCancelled.jsx';
import InvalidConfig from './screens/InvalidConfig.jsx';
import WelcomeScreen from './screens/WelcomeScreen.jsx';

import { useAppStore, SCREENS } from './store.js';

import Navbar from './components/Navbar.jsx';

function App() {
  let screen;

  const screenType = useAppStore((store) => store.screen);
  const config = useAppStore((store) => store.config);

  const inputFilePath = useAppStore((store) => store.inputFilePath);
  const document = useAppStore((store) => store.document); // could be errors or input data
  const errorFilePath = useAppStore((store) => store.errorFilePath);

  const isMappingDocument = useAppStore((store) => store.isMappingDocument);

  const outputFilePath = useAppStore((store) => store.outputFilePath);
  const mappingFilePath = useAppStore((store) => store.mappingFilePath);

  const errorMessage = useAppStore((store) => store.errorMessage);
  const isRuntimeError = useAppStore((store) => store.isRuntimeError);

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
      return <WelcomeScreen config={config} />;
    }

    case SCREENS.MAIN: {
      screen = <MainScreen />;
      break;
    }

    case SCREENS.INVALID_CONFIG: {
      return <InvalidConfig errorMessage={errorMessage!} config={config} />;
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
      screen = <ProcessingInProgress />;
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
