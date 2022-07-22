import exitHook from 'async-exit-hook';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'node:fs';
import fetch from 'node-fetch';
import { machineIdSync } from 'node-machine-id';

export interface CommandExecutionEvent {
  eventType: string;
  // Identifiers
  cliId: string;
  machineId: string; // Hash of OS-native UUID/GUID
  // Flags
  flags: string[];
  // Status
  exitCode: number;
  // CLI version
  version?: string;
  // Timing
  durationMs: number;
  unixTimestampMs: number;
}

export interface ConsoleCatOptions {
  cliId: string; // Console Cat ID for the CLI.
  version?: string;
  apiUrl?: string; // URL for Console Cat API.
  debug?: boolean; // Print information for debugging purposes.
}

const DEFAULT_API_URL = 'https://api.consolecat.dev';

export class ConsoleCat {
  static eventsFilePath(options: ConsoleCatOptions) {
    const tmpDir = path.join(os.tmpdir(), options.cliId);
    return path.join(tmpDir, 'events.jsonl');
  }

  static export(options: ConsoleCatOptions, done?: () => void) {
    try {
      const tmpDir = path.join(os.tmpdir(), options.cliId);
      const eventsFilePath = path.join(tmpDir, 'events.jsonl');

      if (!fs.existsSync(eventsFilePath)) {
        if (options.debug) {
        }
        return;
      }

      const apiUrl = options.apiUrl ?? DEFAULT_API_URL;

      const events = fs
        .readFileSync(eventsFilePath, 'utf-8')
        .split('\n')
        .filter(event => event !== '')
        .map(event => JSON.parse(event));

      // Send telemetry to Console Cat
      fetch(apiUrl + '/events', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
        }),
      }).then(response => {
        // Clear the JSONL file if correct
        if (response.ok) {
          fs.unlinkSync(eventsFilePath);
          if (options.debug) {
            console.log(`Successfully flushed ${events.length} events`);
          }
        } else if (options.debug) {
          console.log(response.body);
        }
        done?.();
      });
    } catch (e) {
      if (options.debug) console.log(e);
      done?.();
    }
  }

  static initialize(options: ConsoleCatOptions) {
    if (process.env.DO_NOT_TRACK && process.env.DO_NOT_TRACK !== '0') {
      // Follow Console Do Not Track (DNT)
      return;
    }

    if (!options.cliId) {
      throw new Error('Missing CLI ID for Console Cat!');
    }

    // Check if events failed to flush
    this.export(options);

    const startUnixTimestampMs = Date.now();

    const executionEventStart = {
      eventType: 'command_execution',
      cliId: options.cliId,
      machineId: machineIdSync(),
      version: options.version,
    };

    exitHook(done => {
      try {
        const executionEvent: CommandExecutionEvent = {
          ...executionEventStart,
          flags: process.argv.filter(arg => arg.startsWith('-')),
          unixTimestampMs: startUnixTimestampMs,
          durationMs: Date.now() - startUnixTimestampMs,
          exitCode: process.exitCode ?? 0,
        };

        const tmpDir = path.join(os.tmpdir(), options.cliId);
        const eventsFilePath = path.join(tmpDir, 'events.jsonl');

        if (options.debug) {
          console.debug(JSON.stringify(executionEvent, null, 4));
          console.debug(eventsFilePath);
        }

        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir);
        }

        // Add latest event to buffer
        fs.appendFileSync(
          eventsFilePath,
          JSON.stringify(executionEvent) + '\n',
          {}
        );

        // Send telemetry to Console Cat
        this.export(options, done);
      } catch (e) {
        if (options.debug) console.log(e);
        done?.();
      }
    });
  }
}
