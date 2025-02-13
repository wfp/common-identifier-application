export enum EVENT {
  FILE_DROPPED = 'fileDropped',

  PREPROCESSING_DONE = 'preprocessingDone',
  PROCESS_FILE = 'processFile',
  PROCESSING_DONE = 'processingDone',
  PREPROCESS_FILE_OPEN_DIALOG = 'preProcessFileOpenDialog',
  PROCESSING_CANCELLED = 'processingCancelled',
  OPEN_OUTPUT_FILE = 'openOutputFile',

  CONFIG_CHANGED = 'configChanged',
  REQUEST_CONFIG_UPDATE = 'requestConfigUpdate',
  LOAD_NEW_CONFIG = 'loadNewConfig',
  REMOVE_USER_CONFIG = 'removeUserConfig',

  QUIT = 'quit',
  ERROR = 'error',
  ACCEPT_TERMS_AND_CONDITIONS = 'acceptTermsAndConditions',
}