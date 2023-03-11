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
exports.Accumulator = void 0;
const debug_1 = __importDefault(require("debug"));
const transport_1 = require("./transport");
const debug = (0, debug_1.default)('pino-newrelic:accumulator');
class Accumulator {
    constructor(options) {
        var _a;
        this.options = options;
        debug('Initializing accumulator');
        this._transport = new transport_1.Transport(options);
        this._list = [];
        this._timer = setInterval(() => {
            this.flush().catch((err) => {
                var _a;
                debug(`Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err.message}`);
            });
        }, (_a = options.intervalMs) !== null && _a !== void 0 ? _a : 1000);
    }
    add(input) {
        var _a;
        this._list.push(input);
        if (this._list.length >= ((_a = this.options.maxLines) !== null && _a !== void 0 ? _a : 100)) {
            this.flush().catch((err) => {
                var _a;
                debug(`Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err.message}`);
            });
        }
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._list.length > 0) {
                debug('Flushing %d lines', this._list.length);
                yield this._transport.send(this._list);
                this._list.length = 0;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('Closing accumulator');
            clearInterval(this._timer);
            this
                .flush()
                .then(this._transport.close)
                .catch((err) => {
                var _a;
                debug(`Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err.message}`);
            });
        });
    }
}
exports.Accumulator = Accumulator;
