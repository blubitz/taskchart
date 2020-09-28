// date & time library
const moment = require('moment')
// chart library
const Chart = require('chart.js')
// zoom and pan library
const zoom = require('chartjs-plugin-zoom')
// random color generator library
const randomColor = require('randomcolor')
// date and time selector
const flatpickr = require('flatpickr')
// user prompt and dialog library
var vex = require('vex-js')
vex.registerPlugin(require('vex-dialog'))
vex.defaultOptions.className = 'vex-theme-plain'
// file IO
const fs = require('fs')

let file = fs.readFileSync('./data/data.json')
// data structure
// [
//   {
//     task: "task1",
//     log: [
//       ["2020-01-01", "2020-01-02"],
//       ["2020-01-03", "2020-01-04"]
//     ]
//   }...
// ]

// stateless object refernced by DOM
var tasks = JSON.parse(file)

// canvas DOM
var ctx = document.getElementById('chart').getContext('2d')
// task selector
var taskSelector = document.getElementById('task')
// entry display
var entries = document.getElementById('entries')


// update chart datasets using tasks[]
function refreshChart(chart) {
  // clear previous data
  chart.data.datasets = []

  // iterate tasks loading new data
  for (let i = 0; i < tasks.length; i++) {
    let label = tasks[i].task
    let log = tasks[i].log
    // data set element
    chart.data.datasets.push({
      label: label,
      data: logToData(log),
      backgroundColor: randomColor({format: 'rgba', alpha: 0.1}),
      lineTension: 0  // no curve lines
    })
  }

  // display in DOM
  chart.update()
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

// push new task to tasks[]
// input: task name
function addTask(name) {
  tasks.push({
    task: name,
    log: []
  })
}

// remove task at index in tasks[]
function removeTask(index) {
  tasks.splice(index, 1)
}

// input: index of task, start (moment.js), end (moment.js)
function pushEntry(index, start, end) {
  tasks[index].log.push([start, end])
}

// remove most recent entry
// input: index of task
function popEntry(index) {
  tasks[index].log.pop()
}

// add / remove new task from DOM task selector
function updateTaskSelector() {
  // clear current tasks & entries
  taskSelector.innerHTML = `<option value="edit">Edit...</option>`
  // populate tasks with new data
  for (let i = 0; i < tasks.length; i++) {
    taskSelector.innerHTML = `<option value="${i}">${tasks[i].task}</option>` + taskSelector.innerHTML
  }
  updateDOMEntries(tasks.length - 1)
}

// show entries of task at index in DOM
function updateDOMEntries(index) {
  entries.innerHTML = ''
  if (index >= 0) {
    tasks[index].log.forEach(entry => {
      let start = moment(entry[0]).format('ddd MMM D YYYY, h:mmA')
      let end = moment(entry[1]).format('ddd MMM D YYYY, h:mmA')
      entries.innerHTML = `<p>start: ${start} &nbsp &nbsp end: ${end}</p>` + entries.innerHTML
    })
  }
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
    time: timeFormat,
    scaleLabel: {display: true, labelString: 'date'}
  };
  chart.update();
}

// create chart and append to DOM
var chart = new Chart(ctx, {
  type: 'line',
  options: {
    scales: {
      xAxes: [{ type: 'time', time: timeFormat, scaleLabel: {display: true, labelString: 'Date'} }],
      yAxes: [{ scaleLabel: {display: true, labelString: 'Total Hours'} }]
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: { enabled: true, mode: 'x', speed: 0.02 }
      }
    }
  }
});

// display data in chart
refreshChart(chart)
// populate selector with tasks
updateTaskSelector()
// display entries corresponding to selected task
updateDOMEntries(taskSelector.value)

flatpickr('.flatpickr', {
  enableTime: true
})
