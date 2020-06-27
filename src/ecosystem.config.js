module.exports = {
  apps: [{
    name: 'pi-sensor-monitor',
    script: './src/index.js',

    interpreter_args: ' --max-old-space-size=250',
    max_memory_restart: '300M',

    instances: 1,
    exp_backoff_restart_delay: 100,

    log_file: 'pi-sensor-monitor.log',
    merge_logs: true,
    time: true,

    watch: true,
    ignore_watch: ['node_modules', 'pi-sensor-monitor.log', '.git', 'db'],
    watch_options: {
      followSymlinks: false
    },

    env: {
      APP_CONFIG: ''
    },
    env_mock: {
      APP_CONFIG: 'mock'
    }
  }]
}
