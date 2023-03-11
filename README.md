# Pino New Relic

This is a legacy Pino Transport to ship logs to New Relic.

## Use with an Applicaiton using Pino Logger

Let's say you have a cool web server/application that uses Pino Logger.  Just add 
`pino-new-relic` to your project using your favorite package manager.  Here's how
you do it with `yarn`:

```
$ yarn add pino-new-relic
```

Now just pipe your application's output to `pino-new-relic`.  This can be done by
updating your start script in your `package.json` file:

```
...
 "start": "node myapp.js | pino-new-relic [options]",
... 
```

## Options and Configuration

Here are the flags that can be passed to `pino-new-relic`. They can also be configured 
via envars, also described below.  Args will override envars.

| flag | envar | description | default |
|---|---|---|---|
| -d, --dryrun | PN_DRYRUN | Do not send to New Relic, but write to stdout. | false |
| -a, --api-key | PN_API_KEY | New Relic license key (required if dryrun is false). | '' |
| -i, --interval-ms | PN_INTERVAL_MS | Interval to send accumulated log lines. | 1000 |
| -m, --max-lines | PN_MAX_LINES | Maximum number of lines to send to New Relic. Triggers a send. | 100 |
| -e, --eu | PN_EU | Use New Relic EU endpoint. | false |
| -o, --echo-on | PN_ECHO_ON | Turns on echoing log stream as it would be sent to New Relic. Otherwise, nothing it outputed. | false |
| -z, --gzip | PN_GZIP | Compress log lines before sending to New Relic. | false |

No configuration is required, but if no New Relic License Key is included and
`dryrun` is not set to `true` then the logger will error.