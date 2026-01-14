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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { utilityProcess, type UtilityProcess } from 'electron';
import log from 'electron-log';

const workerLog = log.scope('workers');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const WORKER_TIMEOUT = 2 * 60 * 1000;

// TYPES
export type WorkerInitMessage<T> = { type: 'init', payload: T };
export type WorkerCancelMessage = { type: 'cancel' };
export type WorkerInputMessage<T> = WorkerInitMessage<T> | WorkerCancelMessage;

export type WorkerSuccessMessage<R> = { status: 'success', payload: R };
export type WorkerCancelledMessage = { status: 'cancelled' };
export type WorkerFailedMessage = { status: 'error', error: string, errorCode?: string | number; isRuntimeError?: boolean };
export type WorkerReturnMessage<R> = WorkerSuccessMessage<R> | WorkerCancelledMessage | WorkerFailedMessage;

// WORKER MANAGER
export class WorkerManager<TPayload, TResult> {
  private workers = new Set<UtilityProcess>();

  constructor(private workerPath: string) {}

  spawn(payload: TPayload, onMessage: (message: WorkerReturnMessage<TResult>) => void): UtilityProcess {
    // workers are placed into dist-electron/workers/*.js during dev, in app.asar during build
    const workerPath = path.join(__dirname, 'workers', `${this.workerPath}.js`);
    const worker = utilityProcess.fork(workerPath, [], { stdio: ['ignore', 'pipe', 'pipe'] });

    this.workers.add(worker);
    workerLog.debug(`Registering worker from path: ${workerPath}`);

    worker.stderr?.on("data", buf => workerLog.error(`[worker stderr] ${buf.toString().trim()}`));
    worker.stdout?.on("data", buf => workerLog.debug(`[worker stdout] ${buf.toString().trim()}`));

    worker.once("spawn", () => {
      workerLog.info(`Worker process spawned (PID: ${worker.pid})`);
      worker.postMessage({ type: 'init', payload } as WorkerInitMessage<TPayload>);
    });

    worker.on("message", (message: WorkerReturnMessage<TResult>) => {
      onMessage(message);
      this.cleanUp(worker);
    });

    worker.on("error", (err) => {
      workerLog.error(`Worker process error (PID: ${worker.pid}): ${err}`);
      onMessage({ status: "error", error: String(err) } as WorkerFailedMessage);
      this.cleanUp(worker);
    });

    worker.once("exit", (code) => this.cleanUp(worker));
    return worker;
  }

  cancelAll({ hard = false } = {}) {
    workerLog.info(`Cancelling ${this.workers.size} worker(s) ... hard=${hard}`);

    for (const child of Array.from(this.workers)) {
      try {
        if (!hard) {
          child.postMessage({ type: 'cancel' } as WorkerCancelMessage);
          const grace = setTimeout(() => child.kill(), 5000); // 5 seconds to gracefully exit, otherwise death
          child.once('exit', () => clearTimeout(grace));
        } else {
          child.kill();
        }
      } catch (err) {
        workerLog.error(`Failed to cancel worker: ${err}`);
      }
    }
  }

  private cleanUp(child: UtilityProcess) {
    if (this.workers.delete(child))
      workerLog.info(`Deregistering worker process (PID: ${child.pid ?? 'exited'})`);
  }
}
