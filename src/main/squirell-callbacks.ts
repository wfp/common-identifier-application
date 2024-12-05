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

import fs from 'fs';
import path from 'path';
import { REGION } from './active_algorithm.js';
import { app } from 'electron/main';
import { shell } from 'electron';

import Debug from 'debug';
const log = Debug('CID:main:squirrell');

// The name of the shortcut as created on the Desktop
const SHORTCUT_FILE_NAME = `Common ID Tool ${REGION}`;

const SHORTCUT_DESCRIPTION =
  'Common Identifier generation tool for Assistance and Mapping documents.';

function desktopPath(...subPaths: string[]) {
  const desktopDir = path.join(app.getPath('desktop'), ...subPaths);
  return desktopDir;
}

// Attempts to create a desktop shortcut
export function createDesktopShortcut() {
  if (process.platform !== 'win32') return;

  const shortcutFullPath = desktopPath(`${SHORTCUT_FILE_NAME}.lnk`);
  const exePath = process.execPath;
  const appFolder = path.resolve(process.execPath, '..');

  log('Attempting to create shortcut:', shortcutFullPath);

  const success = shell.writeShortcutLink(
    shortcutFullPath,
    // create should update the shortcut if already present
    'create',
    {
      target: exePath,
      cwd: appFolder,
      description: SHORTCUT_DESCRIPTION,
    },
  );

  log('Shortcut creation success: ', success ? 'YES' : 'NO');

  return success;
}

// Handles incoming Application Lifecycle events from Squirrel
export function handleSquirrelEvent() {
  // no arg means this is not for us
  if (process.argv.length === 1) {
    return false;
  }

  const shortcutFullPath = desktopPath(`${SHORTCUT_FILE_NAME}.lnk`);

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      log('App update event triggered -- updating shortcut');

      createDesktopShortcut();
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      log('App uninstall event triggered -- removing shortcut');
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      try {
        // Delete the shortcut file
        fs.unlinkSync(shortcutFullPath);
      } catch (err) {
        // this delete operation should never fail (file presence or access problems)
        log('Unable to delete shortcut -- shortcut not present', err);
      }

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}
