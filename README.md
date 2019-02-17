**NOTE: THIS IS CURRENTLY A WORK IN PROGRESS AND SHOULD NOT BE UTILIZED IN ITS CURRENT STATE**

# winston-papertrail

Logging to Papertrail via Winston

## Install

```sh
$ npm install nick-woodward/winston-papertrail
```

## Usage

```js
const { createLogger, format } = require('winston');
const { Papertrail } = require('winston-papertrail')

const logger = createLogger({
  level: 'info',
  
  transports: [
    new Papertrail({
      url: 'https://logs.papertrailapp.com:12345',

      host: `my-app/api/environment`,
      appName: 'my-app-name',

      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => {
          return `(${level}): ${message}`;
        })
      )
    })
  ]
});

logger.info('this is an example');
```

**Papertrails Example**

```sh
Jan 01 00:00:00 my-app/api/environment my-app-name:  (info): this is an example
```

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| url | null | The Papertrails Host and Port |
| host | The current machines hostname |  |
| appName | The process name | The name of the application |