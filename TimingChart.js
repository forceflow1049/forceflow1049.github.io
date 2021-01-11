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
    this.data = {};
    this.options = {};

    this.createOptions();
  }

  createOptions() {

    // Sets up the optinos dictionary based on the attributes of the TimingChart instance

    this.responsive = true;
    this.maintainAspectRatio = false;
    if (this.style == 'nested') {
      this.options.cutoutPercentage = 50;
    } else if (this.style == "non-nested") {
      this.options.cutoutPercentage = 75;
    }

    if (this.type == "display") {
      this.title = {
                      text: this.name,
                      display: true,
                      position: 'bottom',
                      fontSize: 25,
                      padding: 1,
                    };
    } else if (this.type == "render") {
      this.title = {
                      text: this.name,
                      display: true,
                      position: 'top',
                      fontSize: 65,
                      padding: 20,
                    },
    }

    if (this.type == 'display') {
      this.legend = legend: {
                              display: false,
                           };
    } else if (this.type == 'render') {
      this.legend = legend: {
                              display: true,
                              position: 'right',
                              align: 'center',
                              labels:{
                                      pointStyle:'circle',
                                      usePointStyle:true,
                                      fontSize: 35,
                                      padding: 25
                             }
                           };
    }

    if (this.type == 'display') {
      this.tooltips = tooltips: {
                                  enabled: true,
                                  bodyFontSize: 20,
                                  callbacks: {
                                    label: function(tooltipItems, data) {
                                      var i = tooltipItems.index
                                      var labels = [];
                                        var dateStr = new Date(data.datasets[0].data[i] * 1000).toISOString().substr(11, 8);
                                        labels.push(data.labels[i] + ": " + dateStr);
                                      return labels;}
                                  },
                                };
    } else if (this.type == 'render') {
      this.tooltips = tooltips: {
                                  enabled: false,
                                };
    }
  }

  addToCanvas(canvas) {

    if (canvas) {
      this.chart = new Chart(canvas, {
                          type: 'pie',
                          data: this.data,
                          options: this.options
                      });
    }

  }

}
