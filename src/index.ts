#!/usr/bin/env node
import Yargs from 'yargs/yargs'
import Helpers from 'yargs/helpers'
import { start } from './logger'
import Debug from 'debug'

const debug = Debug('pino-newrelic:cli')

export interface PinoNewRelicCLiOptions {
  dryRun?: boolean
  apiKey?: string
  intervalMs?: number
  maxLines?: number
  eu?: boolean
  echoOn?: boolean
  gzip?: boolean
}

export interface PinoNewRelicOptions {
  dryRun: boolean
  apiKey: string
  intervalMs: number
  maxLines: number
  eu: boolean
  echoOn: boolean
  gzip: boolean
}

const truthy = ['true', 'yes', '1']

function EnvArgToBool (arg: string | undefined, defaultValue: boolean): boolean {
  return arg != null ? truthy.includes(arg.toLocaleLowerCase()) : defaultValue
}

export function run (): void {
  const argv = Yargs(Helpers.hideBin(process.argv)).options({
    d: { type: 'boolean', alias: 'dryrun', description: 'Do not send to New Relic, but write to stdout.' },
    a: { type: 'string', alias: 'api-key', description: 'New Relic license key (required if dryrun is false).' },
    i: { type: 'number', alias: 'interval-ms', description: 'Interval to send accumulated log lines.' },
    m: { type: 'number', alias: 'max-lines', description: 'Maximum number of lines to send to New Relic.' },
    e: { type: 'boolean', alias: 'eu', description: 'Use New Relic EU endpoint.' },
    o: { type: 'boolean', alias: 'echo-on', description: 'Turns on echoing log stream as it would be sent to New Relic.' },
    z: { type: 'boolean', alias: 'gzip', description: 'Compress log lines before sending to New Relic.' }
  }).parseSync()
  debug('CLI args: %O', argv)
  const cliOptions: PinoNewRelicOptions = {
    dryRun: argv.d ?? EnvArgToBool(process.env.PN_DRYRUN, false),
    apiKey: argv.a ?? process.env.PN_API_KEY ?? '',
    intervalMs: argv.i ?? parseInt(process.env.PN_INTERVAL_MS ?? '1000'),
    maxLines: argv.m ?? parseInt(process.env.PN_MAX_LINES ?? '100'),
    eu: argv.e ?? EnvArgToBool(process.env.PN_EU, false),
    echoOn: argv.o ?? EnvArgToBool(process.env.PN_ECHO_ON, false),
    gzip: argv.z ?? EnvArgToBool(process.env.PN_GZIP, false)
  }
  debug('CLI options: %O', cliOptions)
  if (!cliOptions.dryRun && cliOptions.apiKey.length === 0) {
    console.error('Missing required option: api-key (-a, --api-key) without dryrun (-d, --dryrun)')
    process.exit(1)
  }
  start(cliOptions)
}

if (require.main === module) {
  run()
}
