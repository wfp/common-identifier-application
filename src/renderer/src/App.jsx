import { useState } from 'react'
import './App.css'

import Boot from './screens/Boot'
import MainScreen from './screens/MainScreen'
import ValidationSuccess from './screens/ValidationSuccess'
import ValidationFailed from './screens/ValidationFailed'
import FileLoading from './screens/FileLoading'
import ProcessingInProgress from './screens/ProcessingInProgress'
import ProcessingFinished from './screens/ProcessingFinished'


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
  SCREEN_INVALID_CONFIG
} from "./store"
import Navbar  from './components/Navbar'
import LoadNewConfig from './screens/LoadNewConfig'
import ErrorScreen from './screens/Error'
import ConfigUpdated from './screens/ConfigUpdated'
import ProcessingCanceled from './screens/ProcessingCanceled'
import InvalidConfig from './screens/InvalidConfig'
import WelcomeScreen from './screens/WelcomeScreen'


function App() {

  let screen;

  const screenType = useAppStore(store => store.screen);
  const config = useAppStore(store => store.config);

  const inputFilePath = useAppStore(store => store.inputFilePath);
  const inputData = useAppStore(store => store.inputData);
  const validationResult = useAppStore(store => store.validationResult);
  const validationResultDocument = useAppStore(store => store.validationResultDocument);
  const validationErrorsOutputFile = useAppStore(store => store.validationErrorsOutputFile);

  const outputFilePath = useAppStore(store => store.outputFilePath);
  const outputData = useAppStore(store => store.outputData);
  const mappingFilePath = useAppStore(store => store.mappingFilePath);

  const errorMessage = useAppStore(store => store.errorMessage);

  switch (screenType) {
    case SCREEN_ERROR: {
      screen = (<ErrorScreen error={errorMessage} config={config}/>);
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
      screen = (<ValidationSuccess config={config} inputData={inputData} inputFilePath={inputFilePath}/>)
      break;
    }

    case SCREEN_VALIDATION_FAILED: {
      screen = (<ValidationFailed config={config} inputData={validationResultDocument} inputFilePath={inputFilePath} validationResult={validationResult} validationErrorsOutputFile={validationErrorsOutputFile}/>)
      break;
    }

    case SCREEN_PROCESSING_IN_PROGRESS: {
      screen = (<ProcessingInProgress config={config} inputFilePath={inputFilePath} />)
      break;
    }

    case SCREEN_PROCESSING_FINISHED: {
      screen = (<ProcessingFinished config={config} outputFilePath={outputFilePath} outputData={outputData} mappingFilePath={mappingFilePath} />)
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
