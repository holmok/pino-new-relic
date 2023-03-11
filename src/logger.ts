import { PinoNewRelicOptions } from '.'
import Through from 'through2'
import Pump from 'pump'
import Split from 'split2'
import FS from 'fs'
import DevNull from 'dev-null'
import { Accumulator } from './accumulator'
import Debug from 'debug'

const debug = Debug('pino-newrelic:logger')

export function start (options: PinoNewRelicOptions): void {
  debug('Starting logger')
  const accumulator = new Accumulator(options)
  const thru = Through.obj(callback(options, accumulator))
  const parser = Split(parse)
  const target = options.echoOn ? process.stdout : DevNull()
  Pump(process.stdin, parser, thru, target).on('error', console.error)

  // https://github.com/pinojs/pino/pull/358
  /* istanbul ignore next */
  if (!process.stdin.isTTY && !FS.fstatSync(process.stdin.fd).isFile()) {
    process.once('SIGINT', () => end(accumulator))
    process.once('SIGTERM', () => end(accumulator))
  }
  process.stdin.on('end', () => end(accumulator))
}

function end (acc: Accumulator): void {
  debug('Ending logger')
  acc.close().catch((err: unknown) => {
    console.error(`Error: ${(err as Error).stack ?? (err as Error).message}`)
  })
  console.log()
}

function parse (line: string): any {
  try {
    const output = JSON.parse(line)
    return output
  } catch (err) {
    return {
      level: 30,
      time: Date.now(),
      tags: ['info'],
      msg: line
    }
  }
}

function callback (options: PinoNewRelicOptions, acc: Accumulator): (input: any, enc: unknown, cb: (error?: any, result?: any) => void) => void {
  return (input, _enc, cb) => {
    try {
      if (!(options.dryRun ?? false)) {
        acc.add(input)
      }
      cb(null, `${JSON.stringify(input)}\n`)
    } catch (err: any) {
      cb(new Error(`Unable to process log: "${JSON.stringify(input)}". error: ${err.message as string}`))
    }
  }
}
