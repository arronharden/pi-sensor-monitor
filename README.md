# pi-sensor-monitor

## Introduction
The `pi-sensor-monitor` repo is a simple node.js application that will monitor temperature sensors connected to a Raspberry Pi and email an alert if specified criteria are not met.

## Installation
The following OS binary dependencies must be installed first:

```
sudo apt-get install sqlite build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

## Configuration
Create a copy of the template configuration file in `config/app-config-template.json` and save it as `config/app-config.json`. Enter the relevant details for the sensor information connected to the Raspberry Pi, and any relevant alerts.

## Development mode
Development mode will start an instance of node.js which will periodically read the data from the sensor and write it to the SQLite database.

To start in development mode using the default `app_config.json` configuration, run the command:

```
npm run start:dev
```

To start in development mode using the `app_config-mock.json` configuration, run the command:

```
npm run start:dev -- --app_config=mock
```

## Production mode
Production mode uses [PM2](http://pm2.keymetrics.io/) to control the instance of node.js.

To start in production mode, use:

```
npm start
```

To stop the instance, use:

```
npm stop
```

Other PM2 commands and be used to manage the running instance. For example, to view the logs use:

Windows:

```
node .\node_modules\pm2\bin\pm2 logs pi-sensor-monitor
```

MacOS/Linux

```
./node_modules/pm2/bin/pm2 logs pi-sensor-monitor
```
