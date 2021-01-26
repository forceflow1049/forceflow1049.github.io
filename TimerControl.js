class TimerControl {

  // Handles keeping track of what is being timed

  constructor() {

    this.timedEntities = []; // Will hold list of entities being tracked
    this.activeEntity = null; // This is the entity we are currently timing
    this.intervalTimer = null; // Will hold reference after we start setInterval
    this.chartTimer = null; // Will hold referenec to the setInterval for updating the charts
    this.timingActive = false; // Are we currently running the timer?
    this.totalTicksActive = 0; // seconds that the timer has been running
    // Store the timestamp in ms of the last time a tick happened in case the
    // app gets backgrounded and JS execution stops. Can then add in the right
    // number of secconds after
    this.lastTickTime = -1;
    this.turnList = []; // Will hold a set of dictionaries defining each time the speaker changed.
    this.minTurnLength = 10; // seconds; the time before a turn is shown on the timeline

    this.meetingName = "";
    this.attributeNameGender = "Gender";
    this.attributeNameSecondary = "Secondary Attribute";
    this.attributeNameTertiary = "Tertiary Attribute";
  };

  setMeetingName() {
    var input = document.getElementById("meetingNameInput");
    var name = input.value;
    if (name != '') {
      this.meetingName = name;

      input.value = "";
      input.placeholder = name;
    }

    return false; // Supress form behavior
  }

  setAttributeName(attr) {

    if (attr == "gender") {
      var input = document.getElementById("genderAttributeNameInput");
      var name = input.value;
      if (name != '') {
        this.attributeNameGender = name;
        input.value = "";
        input.placeholder = name;

        document.getElementById("genderChartHintText").innerHTML = `<center>Add ${name.toLowerCase()}s to your speakers to see this chart!</center>`;
        genderChart.chart.options.title.text = name;
        genderChart.updateChart()
      }
    } else if (attr == "secondary") {
      var input = document.getElementById("secondaryAttributeNameInput");
      var name = input.value;
      if (name != '') {
        this.attributeNameSecondary = name;
        input.value = "";
        input.placeholder = name;
        secondaryChart.chart.options.title.text = name;
        secondaryChart.updateChart()
      }
    } else if (attr == "tertiary") {
      var input = document.getElementById("tertiaryAttributeNameInput");
      var name = input.value;
      if (name != '') {
        this.attributeNameTertiary = name;
        input.value = "";
        input.placeholder = name;
        tertiaryChart.chart.options.title.text = name;
        tertiaryChart.updateChart()
      }
    }

    return false; // Supress form behavior
  }

  setMinTurnLength() {

    var valueInput = document.getElementById('timelineFilterThresholdInput');
    var value = valueInput.value;

    this.minTurnLength = parseInt(value.replace(/[^0-9 .]/g, "")); // Strip letters
    valueInput.value = "";
    valueInput.placeholder = this.minTurnLength + " sec";

    timelineChart.updateTimeline(this.turnList);

    return(false);
  }


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



    if (this.activeEntity != null) {
      this.activeEntity.ticksActiveThisTurn = 0; // Set the old one to zero
    }
      this.activeEntity = entity; // New entity

    if (entity != null) {
      // Log the new speaking turn
      var newTurn = {
        name: this.activeEntity.displayName,
        length: 0,
        colorIndex: this.activeEntity.colorIndex,
      };
      this.turnList.push(newTurn);
    }
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

    // Update the master time
    this.totalTicksActive += ticksToAdd;
    var date = new Date(this.totalTicksActive * 1000).toISOString().substr(11, 8);
    document.getElementById("masterTimeDisplay").innerHTML = date;

    // Update the active entity
    if(this.activeEntity) {
      this.activeEntity.addTicks(ticksToAdd);
      if (this.turnList.length > 0) {
        this.turnList[this.turnList.length-1].length = this.activeEntity.ticksActiveThisTurn; // Also update the current turn
      }
    }
  }

  updateCharts() {
  speakerChart.updateChart();
  genderChart.updateChart();
  timelineChart.updateTimeline();
  }

  downloadChart(chart) {

    var canvas;
    var filename;

    if (chart == 'speakerChart') {
      if (this.meetingName != "") {
        speakerRenderChart.chart.options.title.text = this.meetingName + " - Speakers";
      }
      speakerRenderChart.updateChart(this.timedEntities);
      canvas = document.getElementById('speakerChartRenderCanvas');
      filename = 'speaker_chart.png'
      // Color the background of the plot
      fillCanvasBackgroundWithColor(canvas, 'white');
    } else if (chart == "genderChart") {
      if (this.meetingName != "") {
        genderRenderChart.chart.options.title.text = this.meetingName + " - Gender";
      }
      genderRenderChart.updateChart(this.timedEntities);
      canvas = document.getElementById('genderChartRenderCanvas');
      filename = "gender_chart.png"
      // Color the background of the plot
      fillCanvasBackgroundWithColor(canvas, 'white');
    } else if (chart == "timelineChart") {
      if (this.meetingName != "") {
        timelineRenderChart.chart.options.title.text = this.meetingName + " - Timeline";
      }
      timelineRenderChart.updateTimeline(this.turnList);
      canvas = document.getElementById('timelineChartRenderCanvas');
      filename = 'timeline.png'
      // Color the background of the plot
      fillCanvasBackgroundWithColor(canvas, 'white');
    }

    // save as image
    canvas.toBlob(function(blob) {
      saveAs(blob, filename);
    }, 'image/png');

  }

  downloadData() {

    // Function to format the data as a CSV table and present it for download

    if (this.timedEntities.length > 0) {
      var hasGender = false;

      // First loop the data to see which attributes the user has actually used
      for (var i=0; i<this.timedEntities.length; i++) {
        let entity = this.timedEntities[i];
        if (entity.gender != '') {
          hasGender = true;
        }
      }

      // Now build the header with only the attributes needed
      var csvString = 'Name,';
      if (hasGender) {
        csvString += this.attributeNameGender + ','
      }
      csvString += 'Speaking Time (sec)\n';

      // Loop the timedEntities and build a row for each
      for (var i=0; i<this.timedEntities.length; i++) {
        let entity = this.timedEntities[i];
        csvString += entity.displayName + ",";
        if (hasGender) {
          csvString += entity.gender + ",";
        }
        csvString += entity.ticksActive + '\n';
      }

      var blob = new Blob([csvString], {type: "text/csv;charset=utf-8"});
      saveAs(blob, "meeting_data.csv");
    }

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
    //document.getElementById("timelineChartHint").style.display = 'none';
    this.updateCharts();
  }

  stopTiming() {

    clearInterval(this.intervalTimer);
    clearInterval(this.chartTimer);

    this.lastTickTime = -1; // So that we don't accidentally add a bunch of time when we restart
  }

  sortEntitesByTalkingTime() {

    // Function to sort the list of timed entities by their talking time.

    // clone the entities so that we don't mess up the main button order
    var clone = this.timedEntities.slice();
    clone.sort(function(a,b) {
        return b.ticksActive - a.ticksActive
    });
    return clone
  }


}
