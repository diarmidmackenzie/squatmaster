const calibrationUIMessages = {
  start: 'Ensure your safety pins are in place at a suitable height.  Position the hooks just below shoulder height, and place an empty bar across the hooks.',
  hooks: 'Without moving the bar yet, duck under and brace your shoulders against the bar',
  top: 'Stand up to your full height, and take a step back',
  depth: 'Squat down to your target depth: thighs parallel to the floor',
  safety: 'Bend down further, so that the bar sits on your safety pins',
  review: 'Stand up again.  If you are happy, nod, and return the bar to the rack',
  done: 'Calibration is now complete'
}

const calibrationUIPositions = {
  start: '',
  hooks: 'racked bar position',
  top: 'height at top of squat',
  depth: 'target depth',
  safety: 'safety pin depth',
  review: '',
  done: '',
}

AFRAME.registerComponent('calibration-flow', {

  dependencies: ['bar-position'],

  init() {

    this.nodEvent = this.nodEvent.bind(this)
    this.shakeEvent = this.shakeEvent.bind(this)
    
    this.el.addEventListener('nod', this.nodEvent);
    this.el.addEventListener('shake', this.shakeEvent);

    // UI state
    this.stage = 'start' // one of: start, hooks, top, depth, safety, review, done
    this.saving = false
    this.deleting = false

    this.calibrationUI = document.getElementById('calibration-ui')
  },

  update() {
    this.updateUI()
  },

  remove() {
    this.el.removeEventListener('nod', this.nodEvent);
    this.el.removeEventListener('shake', this.shakeEvent);
  },

  beginCalibrationProcess() {

    this.stage = 'start'
    this.calibrationUI.object3D.visible = true
    this.updateUI()

  },

  endCalibrationProcess() {
    this.calibrationUI.object3D.visible = false
    this.el.emit('calibration-complete')
  },

  getBarPosition() {

    const component = this.el.components['bar-position']
    return component.barPosition
  },

  // displays "saving" message for 1 second, then moves to next stage.
  moveToStage(stage) {

    this.saving = true
    this.updateUI()

    setTimeout(() => {
      this.stage = stage
      this.saving = false
      this.updateUI()
    }, 1000)
  },

  // equivalent function when moving back a stage...
  moveBackToStage(stage) {

    this.deleting = true

    // short timeout, just to avoid duplicate shakes...
    setTimeout(() => {
      this.stage = stage
      this.deleting = false
      this.updateUI()
    }, 500)
  },

  nodEvent() {

    let yPos

    switch (this.stage) {

      case 'start':
        // no data to record yet.
        this.moveToStage('hooks')
        break

      case 'hooks':
        // new Vector3 to ensure update happens.
        const pos = new THREE.Vector3()
        pos.copy(this.getBarPosition())
        this.el.setAttribute('bar-monitor', {hookPosition: pos})
        this.moveToStage('top')
        break
  
      case 'top':
        ypos = this.getBarPosition().y
        this.el.setAttribute('bar-monitor', {topHeight: ypos})
        this.moveToStage('depth')
        break

      case 'depth':
        ypos = this.getBarPosition().y
        this.el.setAttribute('bar-monitor', {targetDepth: ypos})
        this.moveToStage('safety')
        break

      case 'safety':
        ypos = this.getBarPosition().y
        this.el.setAttribute('bar-monitor', {safetyPinHeight: ypos})
        this.moveToStage('review')
        break

      case 'review':
        this.moveToStage('done')
        break

      case 'done':
        this.endCalibrationProcess()
        break

      default:
        console.error("Hit Nod in unexpected state: ", this.stage)
        break
    }
  },

  shakeEvent() {

    switch (this.stage) {

      case 'start':
        // no effect
        break

      case 'hooks':
        this.moveBackToStage('start')
        break
  
      case 'top':
        this.moveBackToStage('hooks')
        break

      case 'depth':
        this.moveBackToStage('top')
        break

      case 'safety':
        this.moveBackToStage('depth')
        break

      case 'review':
        this.moveBackToStage('safety')
        break

      case 'done':
        // no effect - too late
        // (TBC - we could desig a flow to restart the whole calibration process again)
        break
         
      default:
        console.error("Hit Nod in unexpected state: ", this.stage)
        break
    }
  },

  updateUI() {

    this.calibrationUI.setAttribute('calibration-ui',
                                     {saving: this.saving,
                                      deleting: this.deleting,
                                      position: calibrationUIPositions[this.stage],
                                      message: calibrationUIMessages[this.stage]})
  }
})

AFRAME.registerComponent('calibration-ui', {

  schema: {
    saving: {default: false},
    deleting: {default: false},
    position: {default: ''},
    message: {default: ''},
  },

  init() {
    this.circle = document.createElement('a-circle')
    this.circle.setAttribute('radius', 1)
    this.circle.setAttribute('color', 'yellow')
    this.el.appendChild(this.circle)

    this.text = document.createElement('a-entity')
    this.text.setAttribute('text', {color: 'black',
                                    width: 2,
                                    wrapCount: 40,
                                    align: 'center'})
    this.circle.appendChild(this.text)
  },

  update() {

    let string = ''
    if (this.data.saving) {
      string += `Saving ${this.data.position}...\n\n`
    }
    if (this.data.deleting) {
      string += `Deleting ${this.data.position}...\n\n`
    }

    string += this.data.message

    this.text.setAttribute('text', `value: ${string}`)
  }
});
