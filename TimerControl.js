class TimerControl {

  // Handles keeping track of what is being timed

  constructor() {

    this.timedEntities = []; // Will hold list of entities being tracked
    this.activeEntity = null; // This is the entity we are currently timing
    this.intervalTimer = null; // Will hold reference after we start setInterval
    this.chartTimer = null; // Will hold referenec to the setInterval for updating the charts
    this.timingActive = false; // Are we currently running the timer?
    // Store the timestamp in ms of the last time a tick happened in case the
    // app gets backgrounded and JS execution stops. Can then add in the right
    // number of secconds after
    this.lastTickTime = -1;

  };

  getEntityByName(name) {

    for (var i=0; i < this.timedEntities.length; i++) {
      if(this.timedEntities[i].name == name) {
        return this.timedEntities[i];
      }
    }
  }


  createTimedEntity() {

    var displayName = document.getElementById("newNameInput").value;
    var cleanedName = cleanName(displayName);

    if (cleanedName != '') {

      var nameTaken = false;
      for (var i=0; i < this.timedEntities.length; i++) {
          if(this.timedEntities[i].name == cleanedName) {
            nameTaken = true;
          }
      }
      if (!nameTaken) {
        var entity = new TimedEntity(displayName);
        entity.createButton();
        this.addTimedEntity(entity);
        document.getElementById("newNameInput").value = '';
      }
    }

    return false; // Stop the form from submitting

  }

  addTimedEntity(entity) {

    // Adds an entity created separately from this TimerControl.
      // NOTE: If you add directly, you're responsible for checking for name
    // conflicts. Better to use createTimedEntity()

    entity.setOwner(this);
    this.timedEntities.push(entity);

  }

  removeTimedEntity(entity) {

    for (var i=0; i < this.timedEntities.length; i++) {
      if(this.timedEntities[i] == entity) {
        this.timedEntities.splice(i, 1);
        if (this.activeEntity == entity) {
          this.activeEntity = null;
        }
      }
    }

    this.rebuildButtons();
    this.updateCharts();
  }

  addGender(entityName) {

    var gender = document.getElementById(entityName+'GenderInput').value;
    this.getEntityByName(entityName).addGender(gender);

    $(`#${entityName}DropdownButton`).dropdown('hide');

    // Hide the hint
    document.getElementById("genderChartHint").style.display = 'none';
    this.updateCharts();

    return false; // Stop the page from reloading on form submit.
  }

  rebuildButtons() {

    // Clear the div holding the buttons and rebuild it

    primaryChartColorIterator = 0; // Reset before we rebuild the buttons

    document.getElementById('timedEtityButtons').innerHTML = '';
    for (var i=0; i < this.timedEntities.length; i++) {
        this.timedEntities[i].createButton();
        if (this.activeEntity) {
          if (this.activeEntity == this.timedEntities[i]) {
            this.timedEntities[i].makeActive(); // To restore its color
          }
        }
    }
  }

  setActiveEntity(entity) {

    if (entity == null) { // We've pressed the No Speaker button
      $(".btn-success").removeClass('btn-success').addClass('btn-secondary');
      $("#noSpeakerButton").removeClass("btn-secondary").addClass('btn-success');
    }

    this.activeEntity = entity;

  }

  renameEntity(existingName) {

    var displayName = document.getElementById(existingName+'NewNameInput').value;
    var cleanedName = cleanName(displayName);

    if (cleanedName != "") {

      // Find the entity in the list and also check that the new name isn't
      // already being used
      var match_i = null;
      var nameTaken = false;
      for (var i=0; i < this.timedEntities.length; i++) {
          if(this.timedEntities[i].name == existingName) {
            match_i = i;
          }
          if(this.timedEntities[i].name == cleanedName) {
            nameTaken = true;
          }
      }
      if (nameTaken == false) {
        this.timedEntities[match_i].changeName(displayName);
        this.rebuildButtons();
      } else {
        console.log("tc.renameEntity: Error: name in use!")
      }
    }

    return false; // Stop the form from submitting
  }

  tick() {

    // Called every 1 second

    var ticksToAdd = 1;
    let nowTime = new Date().getTime();
    if ((this.lastTickTime != -1) && (nowTime - this.lastTickTime) > 2000) { // ms. Allow for a little slop here to account for inprecise timing
      ticksToAdd = (nowTime - this.lastTickTime)/1000;
    }
    this.lastTickTime = nowTime;

    if(this.activeEntity) {
      this.activeEntity.addTicks(ticksToAdd);
    }
  }

  updateCharts() {
  this.updateSpeakerChart();
  this.updateGenderChart();
  }

  updateSpeakerChart(render=false) {

    // render=true indicates we are creating a PNG for download

    var names = [];
    var ticks = [];

    for (var i=0; i < this.timedEntities.length; i++) {
      var entity = this.timedEntities[i];
      names.push(entity.displayName);
      ticks.push(entity.ticksActive);
    }

    if (render == false) {
      speakerChart.data.labels = names;
      speakerChart.data.datasets[0].data = ticks;

      speakerChart.update();
    } else {
      speakerRenderChart.data.labels = names;
      speakerRenderChart.data.datasets[0].data = ticks;

      speakerRenderChart.update(0);
    }
  }

  updateGenderChart(render=false) {

    // render=true indicates we are creating a PNG for download

    var genders_ticks = {}; // The number of speaking seconds per gender
    var genders_counts = {}; // The number of entities per gender

    for (var i=0; i < this.timedEntities.length; i++) {
      var entity = this.timedEntities[i];
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

    if (render == false) {
      genderChart.data.labels = labels;
      genderChart.data.datasets[0].data = ticks;
      genderChart.data.datasets[1].data = counts;

      genderChart.update();
    } else {
      genderRenderChart.data.labels = labels;
      genderRenderChart.data.datasets[0].data = ticks;
      genderRenderChart.data.datasets[1].data = counts;

      genderRenderChart.update(0);
    }

  }

  downloadChart(chart) {

    var canvas;
    var filename;

    if (chart == 'speakerChart') {
      this.updateSpeakerChart(true);
      canvas = document.getElementById('speakerChartRenderCanvas');
      filename = 'speaker_chart.png'
      // Color the background of the plot
      fillCanvasBackgroundWithColor(canvas, 'white');
    } else if (chart == "genderChart") {
      this.updateGenderChart(true);
      canvas = document.getElementById('genderChartRenderCanvas');
      filename = "gender_chart.png"
      // Color the background of the plot
      fillCanvasBackgroundWithColor(canvas, 'white');
    }

    // save as image
    canvas.toBlob(function(blob) {
      console.log(blob);
      console.log(canvas.height, canvas.width);
      saveAs(blob, filename);
    }, 'image/png');

  }

  toggleTiming() {
    if (this.timingActive == false) {
      this.startTiming();
      this.timingActive = true;
      $('#toggleTiming').removeClass('btn-warning').addClass('btn-danger');
      $('#toggleTiming').html('Pause Timing');
    } else {
      this.stopTiming();
      this.timingActive = false;
      $('#toggleTiming').removeClass('btn-danger').addClass('btn-warning');
      $('#toggleTiming').html('Start Timing');
    }
  }

  startTiming() {

    var t = this; // Need this because the scope of setInterval is Window
    this.intervalTimer = setInterval(function(){t.tick();}, 1000);
    this.chartTimer = setInterval(function(){t.updateCharts();}, 5000);

    // Hide the hint
    document.getElementById("speakerChartHint").style.display = 'none';
    this.updateCharts();
  }

  stopTiming() {

    clearInterval(this.intervalTimer);
    clearInterval(this.chartTimer);

    this.lastTickTime = -1; // So that we don't accidentally add a bunch of time when we restart

  }

}
