"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
const debug_1 = __importDefault(require("debug"));
const axios_1 = __importDefault(require("axios"));
const zlib_1 = require("zlib");
const levels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal'
};
const debug = (0, debug_1.default)('pino-newrelic:transport');
let sending = false;
class Transport {
    constructor(options) {
        this.options = options;
        this.sending = false;
        debug('Initializing transport');
        const axiosConfig = {
            baseURL: this.options.eu ? 'https://log-api.eu.newrelic.com' : 'https://log-api.newrelic.com',
            timeout: this.options.intervalMs
        };
        this.axios = axios_1.default.create(axiosConfig);
    }
    send(input) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            debug('Sending %d lines', input.length);
            sending = true;
            const data = input.map((line) => {
                return Object.assign(Object.assign({ message: line.msg.toString(), timestamp: line.time }, Object.assign(Object.assign({}, line), { msg: undefined, time: undefined })), { level: levels[line.level] });
            });
            const headers = {
                'Api-Key': this.options.apiKey,
                'Content-Type': 'application/json'
            };
            try {
                if (this.options.gzip) {
                    const compressed = (0, zlib_1.gzipSync)(JSON.stringify(data));
                    headers['Content-Encoding'] = 'gzip';
                    const response = yield this.axios.post('/log/v1', compressed, { headers });
                    debug('Response: %s', response.status);
                }
                else {
                    const response = yield this.axios.post('/log/v1', JSON.stringify(data), { headers });
                    debug('Response: %s', response.status);
                }
            }
            catch (err) {
                debug(`Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err.message}`);
            }
            finally {
                sending = false;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve) => {
                const closing = setInterval(() => {
                    debug(`Waiting for transport to close (sending: ${sending ? 'true' : 'false'})`);
                    if (!sending) {
                        debug('Sending complete, closing transport');
                        clearInterval(closing);
                        resolve();
                    }
                }, 1000);
            });
        });
    }
}
exports.Transport = Transport;
