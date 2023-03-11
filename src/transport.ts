import { PinoNewRelicOptions } from '.'
import Debug from 'debug'
import Axios, { AxiosInstance, CreateAxiosDefaults } from 'axios'
import { gzipSync } from 'zlib'

const levels: { [key: number]: string } = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
}

const debug = Debug('pino-newrelic:transport')
let sending = false
export class Transport {
  private readonly sending = false
  private readonly axios: AxiosInstance
  constructor (private readonly options: PinoNewRelicOptions) {
    debug('Initializing transport')
    const axiosConfig: CreateAxiosDefaults = {
      baseURL: this.options.eu ? 'https://log-api.eu.newrelic.com' : 'https://log-api.newrelic.com',
      timeout: this.options.intervalMs
    }
    this.axios = Axios.create(axiosConfig)
  }

  async send (input: any[]): Promise<void> {
    debug('Sending %d lines', input.length)
    sending = true
    const data = input.map((line) => {
      return {
        message: line.msg.toString(),
        timestamp: line.time,
        ...{ ...line, msg: undefined, time: undefined },
        level: levels[line.level]
      }
    })
    const headers: { [key: string]: string } = {
      'Api-Key': this.options.apiKey,
      'Content-Type': 'application/json'
    }
    try {
      if (this.options.gzip) {
        const compressed = gzipSync(JSON.stringify(data))
        headers['Content-Encoding'] = 'gzip'
        const response = await this.axios.post('/log/v1', compressed, { headers })
        debug('Response: %s', response.status)
      } else {
        const response = await this.axios.post('/log/v1', JSON.stringify(data), { headers })
        debug('Response: %s', response.status)
      }
    } catch (err: unknown) {
      debug(`Error: ${(err as Error).stack ?? (err as Error).message}`)
    } finally {
      sending = false
    }
  }

  async close (): Promise<void> {
    return await new Promise((resolve) => {
      const closing = setInterval(() => {
        debug(`Waiting for transport to close (sending: ${sending ? 'true' : 'false'})`)
        if (!sending) {
          debug('Sending complete, closing transport')
          clearInterval(closing)
          resolve()
        }
      }, 1000)
    })
  }
}
