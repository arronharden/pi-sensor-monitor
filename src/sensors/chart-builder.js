const { CanvasRenderService } = require('chartjs-node-canvas')

const width = 700
const height = 400
const chartCallback = (ChartJS) => {
  // Global config example: https://www.chartjs.org/docs/latest/configuration/
  ChartJS.defaults.global.elements.rectangle.borderWidth = 2
  // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
  ChartJS.plugins.register({
    // plugin implementation
  })
  // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
  ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
    // chart implementation
  })
}

module.exports.createTemperatureChartStream = (alias, intervalInHours, measurements) => {
  const canvasRenderService = new CanvasRenderService(width, height, chartCallback)
  const configuration = {
    type: 'line',
    data: {
      datasets: [{
        data: measurements.map(m => ({ x: new Date(m.timestamp), y: m.temperature })),
        borderColor: '#3e95cd',
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 10,
            suggestedMax: 80
          }
        }],
        xAxes: [{
          type: 'time',
          time: {
            unit: 'hour'
          }
        }]
      },
      title: {
        display: true,
        text: `Measurements for sensor '${alias}' over the last ${intervalInHours} hours`
      }
    }
  }
  return canvasRenderService.renderToBuffer(configuration)
}
