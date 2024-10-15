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


import {create as createStore} from 'zustand'
import * as intercomApi from './intercomApi'

import * as storeLogic from '../src/store.logic'

export const SCREEN_BOOT = storeLogic.SCREEN_BOOT;
export const SCREEN_WELCOME = storeLogic.SCREEN_WELCOME
export const SCREEN_MAIN = storeLogic.SCREEN_MAIN
export const SCREEN_FILE_LOADING = storeLogic.SCREEN_FILE_LOADING

export const SCREEN_VALIDATION_SUCCESS = storeLogic.SCREEN_VALIDATION_SUCCESS
export const SCREEN_VALIDATION_FAILED = storeLogic.SCREEN_VALIDATION_FAILED

export const SCREEN_PROCESSING_IN_PROGRESS = storeLogic.SCREEN_PROCESSING_IN_PROGRESS
export const SCREEN_PROCESSING_FINISHED = storeLogic.SCREEN_PROCESSING_FINISHED
export const SCREEN_PROCESSING_CANCELED = storeLogic.SCREEN_PROCESSING_CANCELED

export const SCREEN_LOAD_NEW_CONFIG = storeLogic.SCREEN_LOAD_NEW_CONFIG
export const SCREEN_CONFIG_UPDATED = storeLogic.SCREEN_CONFIG_UPDATED
export const SCREEN_ERROR = storeLogic.SCREEN_ERROR
export const SCREEN_INVALID_CONFIG = storeLogic.SCREEN_INVALID_CONFIG
export const SCREEN_CONFIG_CHANGE = storeLogic.SCREEN_INVALID_CONFIG


export const useAppStore = createStore(storeLogic.storeLogic(intercomApi));