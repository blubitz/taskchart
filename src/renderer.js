// date & time library
const moment = require('moment')
// chart library
const Chart = require('chart.js')
// zoom and pan library
const zoom = require('chartjs-plugin-zoom')
// file IO
const fs = require('fs')

let file = fs.readFileSync('./data/data.json')
// data structure
// [
//   {
//     title: "task1",
//     data: [
//       ["2020-01-01", "2020-01-02"],
//       ["2020-01-03", "2020-01-04"]
//     ]
//   }
// ]
var tasks = JSON.parse(file)

// canvas DOM
var ctx = document.getElementById('chart').getContext('2d')
// graph coordinates
var datasets = []

// iterate tasks
for (let i = 0; i < tasks.length; i++) {
  let label = tasks[i].task
  let log = tasks[i].log
  // data set element
  datasets.push({
    label: label,
    data: logToData(log),
    fill: false,  // remove area fill
    lineTension: 0  // no curve lines
  })
}

// take log object and convert to graph coordinates
// input: (log obeject) [ ["start time", "end time"], ... ]
// output: (data) [ {x: , y: } ... ]
function logToData(log) {
  let comulativeHrs = 0
  let data = []
  // iterate entries
  for (let i = 0; i < log.length; i++) {
    let start = log[i][0]
    let end = log[i][1]
    data.push({x: start, y: comulativeHrs})
    comulativeHrs += moment(end).diff(moment(start), 'hours')
    data.push({x: end, y: comulativeHrs})
  }
  return data
}

// default time
var timeFormat = {
  minUnit: 'hour',
  displayFormats: {
    hour: 'MMM D hA'
  }
}

// adjust the scale of the ticks to unit
function updateScale(chart, unit) {
  timeFormat.unit = (unit == 'auto') ? false : unit

  chart.options.scales.xAxes[0] = {
    type: 'time',
    time: timeFormat
  };
  chart.update();
}

// create chart and append to DOM
var chart = new Chart(ctx, {
  type: 'line',
  data: { datasets: datasets },
  options: {
    scales: {
      xAxes: [{ type: 'time', time: timeFormat }]
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { enabled: true, mode: 'x', speed: 0.02}
      }
    }
  }
});
