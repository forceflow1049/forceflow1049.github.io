class TimingCHart {

  constructor(style, type, name) {

    // style = [nested, non-nested]. Nested is like the gender chart, with a
    // donut for who's in the meeting and one for talking time. Non-nested is
    // like the basic speaking chart, with only one donut for talking time.
    // type = [display, render]. Display charts show in the app, while render
    // charts are used to make the downloadable PNGs

    this.style = style;
    this.type = type;
    this.name = name;
    this.chart = null; // Will hold reference to the Chart.js object
    this.canvas = null; // Will hold reference to the canvas the chart is rendered on
    this.data = {};
    this.options = {};


    this.createOptions();
    this.createData();
  }

  createOptions() {

    // Sets up the optinos dictionary based on the attributes of the TimingChart instance

    this.options.maintainAspectRatio = false;
    if (this.style == 'nested') {
      this.options.cutoutPercentage = 50;
    } else if (this.style == "non-nested") {
      this.options.cutoutPercentage = 75;
    }

    if (this.type == "display") {
      this.options.responsive = true;
      this.options.title = {
                              text: this.name,
                              display: true,
                              position: 'bottom',
                              fontSize: 25,
                              padding: 1,
                            };
    } else if (this.type == "render") {
      this.options.responsive = false;
      this.options.layout = {
                              padding: {
                                        left: 100,
                                        right: 100,
                                        top: 50,
                                        bottom: 50
                                        }
                            };
      this.options.title = {
                              text: this.name,
                              display: true,
                              position: 'top',
                              fontSize: 130,
                              padding: 20,
                            }
    }

    if (this.type == 'display') {
      this.options.legend =  {
                                display: false,
                             };
    } else if (this.type == 'render') {
      this.options.legend = {
                                display: true,
                                position: 'right',
                                align: 'center',
                                labels:{
                                        pointStyle:'circle',
                                        usePointStyle:true,
                                        fontSize: 70,
                                        padding: 20
                                        }
                             };
       if (this.name == 'Speaker') {
         this.options.legend.labels.generateLabels = function(chart) { // This function generates the labels with the talking time. Copied and modied from the source code.
                                                                        var data = chart.data;
                                                                        if (data.labels.length && data.datasets.length) {
                                                                          return data.labels.map(function(label, i) {
                                                                            var meta = chart.getDatasetMeta(0);
                                                                            var ds = data.datasets[0];
                                                                            var arc = meta.data[i];
                                                                            var custom = arc && arc.custom || {};
                                                                            var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                                                            var arcOpts = chart.options.elements.arc;
                                                                            var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                                                            var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                                                            var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                                                            // We get the value of the current label
                                                                            var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];
                                                                            // Convert that value to a datetime
                                                                            var date = new Date(value * 1000).toISOString().substr(11, 8);
                                                                            return {
                                                                              // Instead of `text: label,`
                                                                              // We add the value to the string
                                                                              text: label + " (" + date + ")",
                                                                              fillStyle: fill,
                                                                              strokeStyle: stroke,
                                                                              lineWidth: bw,
                                                                              hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                                                              index: i
                                                                            };
                                                                          });
                                                                        } else {
                                                                          return [];
                                                                        }
                                                                      }
       } else if (this.name == 'Gender') {
         this.options.legend.labels.generateLabels = function(chart) { // This function generates the labels with the talking time. Copied and modied from the source code.
                                                                        var data = chart.data;
                                                                        if (data.labels.length && data.datasets.length) {
                                                                          return data.labels.map(function(label, i) {
                                                                            var meta = chart.getDatasetMeta(0);
                                                                            var ds = data.datasets[0];
                                                                            var arc = meta.data[i];
                                                                            var custom = arc && arc.custom || {};
                                                                            var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                                                            var arcOpts = chart.options.elements.arc;
                                                                            var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                                                            var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                                                            var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                                                            // We get the value of talking time for this label
                                                                            var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];
                                                                            // Convert that value to a datetime
                                                                            var date = new Date(value * 1000).toISOString().substr(11, 8);
                                                                            var num = chart.config.data.datasets[1].data[arc._index];
                                                                            var total = chart.config.data.datasets[1].data.reduce((a, b) => a + b, 0);
                                                                            var frac = Math.round(100*num/total);
                                                                            return {
                                                                              // Instead of `text: label,`
                                                                              // We add the value to the string
                                                                              text: label + ` (${frac}%, ` + date + ")",
                                                                              fillStyle: fill,
                                                                              strokeStyle: stroke,
                                                                              lineWidth: bw,
                                                                              hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                                                              index: i
                                                                            };
                                                                          });
                                                                        } else {
                                                                          return [];
                                                                        }
                                                                      }
       }
     }

    if (this.type == 'display') {
      this.options.tooltips = {
                                enabled: true,
                                bodyFontSize: 20
                              };
      if (this.style == 'non-nested') {
        this.options.tooltips.callbacks = {
                                            label: function(tooltipItems, data) {
                                              var i = tooltipItems.index
                                              var labels = [];
                                              var dateStr = new Date(data.datasets[0].data[i] * 1000).toISOString().substr(11, 8);
                                              labels.push(data.labels[i] + ": " + dateStr);
                                              return labels;}
                                          };
      } else if (this.style == 'nested') {
        this.options.tooltips.callbacks = {
                                            label: function(tooltipItems, data) {
                                              var i = tooltipItems.index
                                              var labels = [];
                                              if (tooltipItems.datasetIndex == 0) { // Tooltip is speaking time
                                                var dateStr = new Date(data.datasets[0].data[i] * 1000).toISOString().substr(11, 8);
                                                labels.push(data.labels[i] + ": " + dateStr);
                                              } else {
                                                var dateStr = data.datasets[1].data[i];
                                                labels.push(data.labels[i] + ": " + dateStr);
                                              }
                                              return labels;}
        }
      }


    } else if (this.type == 'render') {
      this.options.tooltips = {
                                enabled: false,
                              };
    }
  }

  createData() {

    this.data.labels = ['No speakers yet'];
        this.data.datasets = [];
    var tempData = {
                      backgroundColor: primaryChartColors,
                      borderWidth: 1,
                      data: [0]
                   };
    var num = 1;
    if (this.style == "nested") {
      num = 2; // Add another dataset if we're nested
    }
    for (var i=0; i<num; i++) {
      this.data.datasets.push({...tempData}); // Make sure we make a new instance of the dictionary
    }
  }

  addToCanvas(canvas) {

    if (canvas) {
      this.canvas = canvas;
      this.chart = new Chart(canvas, {
                          type: 'pie',
                          data: this.data,
                          options: this.options
                      });
    } else {
      console.log("Error: canvas does not exist!")
    }
  }

  updateChart(timedEntities) {

    // Takes an array of TimedEntity and computes the data for the chart

    if (this.name == 'Speaker') {
      var names = [];
      var ticks = [];

      for (var i=0; i < timedEntities.length; i++) {
        var entity = timedEntities[i];
        names.push(entity.displayName);
        ticks.push(entity.ticksActive);
      }

      this.data.labels = names;
      this.data.datasets[0].data = ticks;

      this.chart.data.labels = names;
      this.chart.data.datasets[0].data = ticks;

      if (this.type == 'display') {
        this.chart.update();
      } else if (this.type == 'render'){
        this.canvas.width = 3840;
        this.canvas.height = 2160;

        this.chart.update(0);
      }
    } else if (this.name == 'Gender') {
      var genders_ticks = {}; // The number of speaking seconds per gender
      var genders_counts = {}; // The number of entities per gender

      for (var i=0; i < timedEntities.length; i++) {
        var entity = timedEntities[i];
        var gender = entity.gender;

        if (gender != '') {
          if (gender in genders_ticks) {
            genders_ticks[gender] += entity.ticksActive;
            genders_counts[gender] += 1;
          } else {
            genders_ticks[gender] = entity.ticksActive;
            genders_counts[gender] = 1;
          }
        }
      }

      var labels = Object.keys(genders_ticks);
      var ticks = [];
      var counts = [];
      for (var i=0; i<labels.length; i++) {
        ticks.push(genders_ticks[labels[i]]);
        counts.push(genders_counts[labels[i]]);
      }
      this.data.labels = labels;
      this.data.datasets[0].data = ticks;
      this.data.datasets[1].data = counts;

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = ticks;
      this.chart.data.datasets[1].data = counts;

      if (this.type == 'display') {
        this.chart.update();
      } else if (this.type == 'render'){
        this.canvas.width = 3840;
        this.canvas.height = 2160;

        this.chart.update(0);
      }
    }
  }

}
