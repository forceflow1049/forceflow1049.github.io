class TimedEntity {

  // One of the people/things we are tracking the talking time of

  constructor(name) {

    this.name = cleanName(name);
    this.displayName = name;
    this.gender = '';
    this.owner = null;
    this.ticksActive = 0; // This will hold the number of seconds this entity has talked\
    this.ticksActiveThisTurn = 0; // This will hold the ticksActive since the instance became active
    this.colorIndex = null; // Holds the primaryChartColorIterator index for the color of the button

  };

  setOwner(owner) {

    // Owner should be a reference to a TimerControl object that has added
    // this entity to its timedEntities list

    this.owner = owner

  }

  changeName(newName) {

    // This should only be called through TimingControl.renameEntity, which
    // checks that newName isn't already in use.

    this.displayName = newName;
    this.name = cleanName(newName);


  }

  addGender(gender) {

    this.gender = gender;
  }

  remove() {

    // Ask the owner to remove this instance

    this.owner.removeTimedEntity(this);

  }

  addTicks(num) {

    this.ticksActive += num;
    this.ticksActiveThisTurn += num;
    this.updateDisplay();

  }

  makeActive() {

    // This will stop timing all other entities owned by this entity's owner
    // and change their appearance

    this.owner.setActiveEntity(this);
    $(".btn-success").removeClass('btn-success').addClass('btn-secondary');
    $("#"+this.name+'MainButton').removeClass('btn-secondary').addClass('btn-success');
    $("#"+this.name+'DropdownButton').removeClass('btn-secondary').addClass('btn-success');

  }

  createButton() {

    // Creates the button that will be used to toggle the entity and adds
    // the button to the timedEtityButtons div

    var html = `
      <div class="btn-group col-sm-6 col-med-6 col-lg-4 col-xl-3 mt-3">
        <button type="button" class="btn btn-secondary" id="${this.name}MainButton">
          <H4>${this.displayName}</H4>
          <div id='${this.name}TimeField'></div>
        </button>
        <button type="button" class="btn dropdown-toggle dropdown-toggle-split col-2" data-toggle="dropdown" id="${this.name}DropdownButton" style="background-color: ${primaryChartColors[primaryChartColorIterator]}"></button>
        <div class="dropdown-menu dropdown-menu-right col-11">
          <form onsubmit="return tc.renameEntity('${this.name}')">
            <div class="row">
              <div class="col-8">
                <input type="text" class="form-control" id="${this.name}NewNameInput" aria-describedby="newNameHelp" placeholder="Rename">
              </div>
              <div class="col-4">
                <button class='btn-primary w-100 h-100' onclick="tc.renameEntity('${this.name}')">Rename</button>
              </div>
            </div>
          </form>
          <form onsubmit="return tc.addGender('${this.name}')">
            <div class="row mt-2">
              <div class="col-8">
                <input type="text" class="form-control" id="${this.name}GenderInput" aria-describedby="newNameHelp" placeholder="Add gender" value="${this.gender}">
              </div>
              <div class="col-4">
                <button class='btn-primary w-100 h-100' onclick="tc.addGender('${this.name}')">Set</button>
              </div>
            </div>
          </form>
          <div class="dropdown-divider"></div>
          <button class="btn-danger h-100" id="${this.name}RemoveButton">Remove</button>
        </div>
      </div>
      `

    $('#timedEtityButtons').append(html);
    this.updateDisplay(); // Add the current time
    this.colorIndex = primaryChartColorIterator;
    primaryChartColorIterator += 1;
    // Register an event listener to make this the active entity when clicked
    var t = this;
    $("#"+this.name+"MainButton").click(function(){t.makeActive();})
    $("#"+this.name+"RemoveButton").click(function(){t.remove();})

  }

  updateDisplay() {

    // Format the seconds appropriately and push this new string to the
    // div corresponding to this entity's time display.

    var date = new Date(this.ticksActive * 1000).toISOString().substr(11, 8);
    document.getElementById(this.name+"TimeField").innerHTML = date;

  }
}
