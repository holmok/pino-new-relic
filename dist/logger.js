"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const through2_1 = __importDefault(require("through2"));
const pump_1 = __importDefault(require("pump"));
const split2_1 = __importDefault(require("split2"));
const fs_1 = __importDefault(require("fs"));
const dev_null_1 = __importDefault(require("dev-null"));
const accumulator_1 = require("./accumulator");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('pino-newrelic:logger');
function start(options) {
    debug('Starting logger');
    const accumulator = new accumulator_1.Accumulator(options);
    const thru = through2_1.default.obj(callback(options, accumulator));
    const parser = (0, split2_1.default)(parse);
    const target = options.echoOn ? process.stdout : (0, dev_null_1.default)();
    (0, pump_1.default)(process.stdin, parser, thru, target).on('error', console.error);
    // https://github.com/pinojs/pino/pull/358
    /* istanbul ignore next */
    if (!process.stdin.isTTY && !fs_1.default.fstatSync(process.stdin.fd).isFile()) {
        process.once('SIGINT', () => end(accumulator));
        process.once('SIGTERM', () => end(accumulator));
    }
    process.stdin.on('end', () => end(accumulator));
}
exports.start = start;
function end(acc) {
    debug('Ending logger');
    acc.close().catch((err) => {
        var _a;
        console.error(`Error: ${(_a = err.stack) !== null && _a !== void 0 ? _a : err.message}`);
    });
    console.log();
}
function parse(line) {
    try {
        const output = JSON.parse(line);
        return output;
    }
    catch (err) {
        return {
            level: 30,
            time: Date.now(),
            tags: ['info'],
            msg: line
        };
    }
}
function callback(options, acc) {
    return (input, _enc, cb) => {
        var _a;
        try {
            if (!((_a = options.dryRun) !== null && _a !== void 0 ? _a : false)) {
                acc.add(input);
            }
            cb(null, `${JSON.stringify(input)}\n`);
        }
        catch (err) {
            cb(new Error(`Unable to process log: "${JSON.stringify(input)}". error: ${err.message}`));
        }
    };
}
