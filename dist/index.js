#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = __importDefault(require("yargs/helpers"));
const logger_1 = require("./logger");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('pino-newrelic:cli');
const truthy = ['true', 'yes', '1'];
function EnvArgToBool(arg, defaultValue) {
    return arg != null ? truthy.includes(arg.toLocaleLowerCase()) : defaultValue;
}
function run() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const argv = (0, yargs_1.default)(helpers_1.default.hideBin(process.argv)).options({
        d: { type: 'boolean', alias: 'dryrun', description: 'Do not send to New Relic, but write to stdout.' },
        a: { type: 'string', alias: 'api-key', description: 'New Relic license key (required if dryrun is false).' },
        i: { type: 'number', alias: 'interval-ms', description: 'Interval to send accumulated log lines.' },
        m: { type: 'number', alias: 'max-lines', description: 'Maximum number of lines to send to New Relic.' },
        e: { type: 'boolean', alias: 'eu', description: 'Use New Relic EU endpoint.' },
        o: { type: 'boolean', alias: 'echo-on', description: 'Turns on echoing log stream as it would be sent to New Relic.' },
        z: { type: 'boolean', alias: 'gzip', description: 'Compress log lines before sending to New Relic.' }
    }).parseSync();
    debug('CLI args: %O', argv);
    const cliOptions = {
        dryRun: (_a = argv.d) !== null && _a !== void 0 ? _a : EnvArgToBool(process.env.PN_DRYRUN, false),
        apiKey: (_c = (_b = argv.a) !== null && _b !== void 0 ? _b : process.env.PN_API_KEY) !== null && _c !== void 0 ? _c : '',
        intervalMs: (_d = argv.i) !== null && _d !== void 0 ? _d : parseInt((_e = process.env.PN_INTERVAL_MS) !== null && _e !== void 0 ? _e : '1000'),
        maxLines: (_f = argv.m) !== null && _f !== void 0 ? _f : parseInt((_g = process.env.PN_MAX_LINES) !== null && _g !== void 0 ? _g : '100'),
        eu: (_h = argv.e) !== null && _h !== void 0 ? _h : EnvArgToBool(process.env.PN_EU, false),
        echoOn: (_j = argv.o) !== null && _j !== void 0 ? _j : EnvArgToBool(process.env.PN_ECHO_ON, false),
        gzip: (_k = argv.z) !== null && _k !== void 0 ? _k : EnvArgToBool(process.env.PN_GZIP, false)
    };
    debug('CLI options: %O', cliOptions);
    if (!cliOptions.dryRun && cliOptions.apiKey.length === 0) {
        console.error('Missing required option: api-key (-a, --api-key) without dryrun (-d, --dryrun)');
        process.exit(1);
    }
    (0, logger_1.start)(cliOptions);
}
exports.run = run;
if (require.main === module) {
    run();
}
