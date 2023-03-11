import { PinoNewRelicOptions } from '.'
import Debug from 'debug'
import { Transport } from './transport'

const debug = Debug('pino-newrelic:accumulator')

export class Accumulator {
  private readonly _list: any[]
  private readonly _timer: NodeJS.Timeout
  private readonly _transport: Transport
  constructor (private readonly options: PinoNewRelicOptions) {
    debug('Initializing accumulator')
    this._transport = new Transport(options)
    this._list = []
    this._timer = setInterval(() => {
      this.flush().catch((err: unknown) => {
        debug(`Error: ${(err as Error).stack ?? (err as Error).message}`)
      })
    }, options.intervalMs ?? 1000)
  }

  add (input: any): void {
    this._list.push(input)
    if (this._list.length >= (this.options.maxLines ?? 100)) {
      this.flush().catch((err: unknown) => {
        debug(`Error: ${(err as Error).stack ?? (err as Error).message}`)
      })
    }
  }

  private async flush (): Promise<void> {
    if (this._list.length > 0) {
      debug('Flushing %d lines', this._list.length)
      await this._transport.send(this._list)
      this._list.length = 0
    }
  }

  async close (): Promise<void> {
    debug('Closing accumulator')
    clearInterval(this._timer)
    this
      .flush()
      .then(this._transport.close)
      .catch((err: unknown) => {
        debug(`Error: ${(err as Error).stack ?? (err as Error).message}`)
      })
  }
}
