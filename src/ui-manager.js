// Top-level UI component that manages visibility of other UIs
AFRAME.registerComponent('ui-manager', {

  init() {
    this.state = {
      calibrated: false,
      inRack: false,
    }

    this.calibrationComplete = this.calibrationComplete.bind(this)
    this.enteredRack = this.enteredRack.bind(this)
    this.exitedRack = this.exitedRack.bind(this)
    this.el.addEventListener('calibration-complete', this.calibrationComplete)
    this.el.addEventListener('entered-rack', this.enteredRack);
    this.el.addEventListener('exited-rack', this.exitedRack);


    this.calibrationUI = document.getElementById('calibration-ui')
    this.insideRackUI = document.getElementById('inside-rack-ui')
    this.outsideRackUI = document.getElementById('outside-rack-ui')
    this.cursor = document.getElementById('cursor')

    this.updateUIs()
  },

  calibrationComplete() {
    this.state.calibrated = true
    this.updateUIs()
  },

  enteredRack() {
    this.state.inRack = true
    this.updateUIs()
  },

  exitedRack() {
    this.state.inRack = false
    this.updateUIs()
  },

  updateUIs() {

    updateVisibility = (el, visible) => {
      if (el && el.object3D) {
        el.object3D.visible = visible
      }
    }

    if (this.state.calibrated) {

      if (this.state.inRack) {
        updateVisibility(this.calibrationUI, false)
        updateVisibility(this.insideRackUI, true)
        updateVisibility(this.outsideRackUI, false)
      }
      else {
        updateVisibility(this.calibrationUI, false)
        updateVisibility(this.insideRackUI, false)
        updateVisibility(this.outsideRackUI, true)
      }

      updateVisibility(this.cursor, false)
    }
    else {
      updateVisibility(this.calibrationUI, true)
      updateVisibility(this.insideRackUI, false)
      updateVisibility(this.outsideRackUI, false)
      updateVisibility(this.cursor, true)
    }
  }
})