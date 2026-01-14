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
import type { WorkerCancelledMessage, WorkerFailedMessage, WorkerInputMessage, WorkerReturnMessage, WorkerSuccessMessage } from "../workers";

export function createWorker<TPayload, TResult>(handler: (payload: TPayload) => Promise<TResult>) {
  let cancelled = false;

  process.parentPort.on("message", async ({ data: message }: { data: WorkerInputMessage<TPayload> }) => {
    if (message.type === "cancel") {
      console.warn("Worker received cancellation request, aborting.");
      cancelled = true;
      process.parentPort.postMessage({ status: "cancelled" } as WorkerReturnMessage<TResult>);
      return;
    };

    if (message.type === "init") {
      try {
        if (cancelled) return process.parentPort.postMessage({ status: 'cancelled' } as WorkerCancelledMessage);
        const result = await handler(message.payload)
        if (cancelled) return process.parentPort.postMessage({ status: 'cancelled' } as WorkerCancelledMessage);

        process.parentPort.postMessage({ status: "success", payload: result } as WorkerSuccessMessage<TResult>);
      }
      catch (error: any) {
        process.parentPort.postMessage({ status: "error", error: error.message, isRuntimeError: true } as WorkerFailedMessage)
      }
      finally {
        setImmediate(() => process.exit(0));
      }
    }
  });

}