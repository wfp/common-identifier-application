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


import { useState } from 'react'

import Boot from './screens/Boot'
import MainScreen from './screens/MainScreen'
import ValidationSuccess from './screens/ValidationSuccess'
import ValidationFailed from './screens/ValidationFailed'
import FileLoading from './screens/FileLoading'
import ProcessingInProgress from './screens/ProcessingInProgress'
import ProcessingFinished from './screens/ProcessingFinished'
import ConfigChange from './screens/ConfigChange'
import LoadNewConfig from './screens/LoadNewConfig'
import ErrorScreen from './screens/Error'
import ConfigUpdated from './screens/ConfigUpdated'
import ProcessingCanceled from './screens/ProcessingCanceled'
import InvalidConfig from './screens/InvalidConfig'
import WelcomeScreen from './screens/WelcomeScreen'


import {
  useAppStore,

  SCREEN_BOOT,
  SCREEN_WELCOME,
  SCREEN_ERROR,
  SCREEN_FILE_LOADING,
  SCREEN_MAIN,
  SCREEN_VALIDATION_FAILED,
  SCREEN_VALIDATION_SUCCESS,
  SCREEN_PROCESSING_IN_PROGRESS,
  SCREEN_PROCESSING_FINISHED,
  SCREEN_LOAD_NEW_CONFIG,
  SCREEN_CONFIG_UPDATED,
  SCREEN_PROCESSING_CANCELED,
  SCREEN_INVALID_CONFIG,
  SCREEN_CONFIG_CHANGE,
} from "./store"

import Navbar  from './components/Navbar'


function App() {

  let screen;

  const screenType = useAppStore(store => store.screen);
  const config = useAppStore(store => store.config);

  const inputFilePath = useAppStore(store => store.inputFilePath);
  const inputData = useAppStore(store => store.inputData);
  const validationResultDocument = useAppStore(store => store.validationResultDocument);
  const validationErrorsOutputFile = useAppStore(store => store.validationErrorsOutputFile);

  const isMappingDocument = useAppStore(store => store.isMappingDocument);

  const outputFilePaths = useAppStore(store => store.outputFilePaths);
  const outputData = useAppStore(store => store.outputData);

  const errorMessage = useAppStore(store => store.errorMessage);
  const isRuntimeError = useAppStore(store => store.isRuntimeError);

  switch (screenType) {
    case SCREEN_ERROR: {
      screen = (<ErrorScreen error={errorMessage} isRuntimeError={isRuntimeError} config={config}/>);
      break;
    }

    case SCREEN_BOOT: {
      return (<Boot />);
    }

    case SCREEN_WELCOME: {
      return (<WelcomeScreen config={config} />)
    }

    case SCREEN_INVALID_CONFIG: {
      return (<InvalidConfig error={errorMessage} config={config} />)
    }

    case SCREEN_LOAD_NEW_CONFIG: {
      screen = (<LoadNewConfig />)
      break;
    }

    case SCREEN_CONFIG_CHANGE: {
      screen = (<ConfigChange />)
      break;
    }

    case SCREEN_CONFIG_UPDATED: {
      screen = (<ConfigUpdated config={config}/>)
      break;
    }

    case SCREEN_MAIN: {
      // TODO: if no config present don't show anything
      screen = (<MainScreen config={config}/>);
      break;
    }

    case SCREEN_FILE_LOADING: {
      screen = (<FileLoading config={config} inputFilePath={inputFilePath}/>)
      break;

    }

    case SCREEN_VALIDATION_SUCCESS: {
      screen = (<ValidationSuccess config={config} inputData={inputData} inputFilePath={inputFilePath} isMappingDocument={isMappingDocument}/>)
      break;
    }

    case SCREEN_VALIDATION_FAILED: {
      screen = (<ValidationFailed config={config} inputData={validationResultDocument} inputFilePath={inputFilePath} validationErrorsOutputFile={validationErrorsOutputFile} isMappingDocument={isMappingDocument}/>)
      break;
    }

    case SCREEN_PROCESSING_IN_PROGRESS: {
      screen = (<ProcessingInProgress config={config} inputFilePath={inputFilePath} />)
      break;
    }

    case SCREEN_PROCESSING_FINISHED: {
      screen = (<ProcessingFinished config={config} outputFilePaths={outputFilePaths} outputData={outputData}  />)
      break;
    }

    case SCREEN_PROCESSING_CANCELED: {
      screen = (<ProcessingCanceled/>);
      break;
    }
  }



  return (
    <>
      <Navbar config={config} screenType={screenType}/>
      {screen}
    </>
  )
}

export default App
