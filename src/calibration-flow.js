const calibrationUIImages = {
  start: '#calibration0',
  bar: '#calibration1',
  hooks: '#calibration2',
  top: '#calibration3', 
  depth: '#calibration4',
  safety: '#calibration5',
  review: '#calibration6',
  done: '#calibration7',
}

const calibrationUISounds = {
  start: '#sound1',
  bar: '#sound3',
  hooks: '#sound4',
  top: '#sound5', 
  depth: '#sound6',
  safety: '#sound7',
  review: '#sound8',
  done: '#sound9',
}

const calibrationUIFollowOnSounds = {
  start: '#sound2'
}


AFRAME.registerComponent('calibration-flow', {

  dependencies: ['bar-position'],

  init() {

    this.nodEvent = this.nodEvent.bind(this)
    this.shakeEvent = this.shakeEvent.bind(this)
    this.reachedHooks = this.reachedHooks.bind(this)
    
    this.el.addEventListener('nod', this.nodEvent);
    this.el.addEventListener('shake', this.shakeEvent);
    this.el.addEventListener('reached-hooks', this.reachedHooks);

    // UI state
    this.stage = 'start' // one of: start, hooks, top, depth, safety, review, done
    this.saving = false
    this.deleting = false

    this.calibrationUI = document.getElementById('calibration-ui')

    this.cameraWorldPosition = new THREE.Vector3()
    this.cameraWorldQuaternion = new THREE.Quaternion()
    this.forwardVector = new THREE.Vector3(0, 0, -1)
    this.directionVector = new THREE.Vector3()

    this.el.addEventListener('enter-vr', () => {
      this.playPrompt(this.stage)
    })
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

    this.playPrompt(stage)

    setTimeout(() => {
      this.stage = stage
      this.saving = false
      this.updateUI()
      
    }, 1000)
  },

  // equivalent function when moving back a stage...
  moveBackToStage(stage) {

    this.deleting = true

    this.playPrompt(stage)

    // short timeout, just to avoid duplicate shakes...
    setTimeout(() => {
      this.stage = stage
      this.deleting = false
      this.updateUI()
      
    }, 500)
  },

  playPrompt(stage) {
    const origin = document.getElementById('sound-origin')

    origin.setAttribute('sound', {src: calibrationUISounds[stage], autoplay: true})
    //origin.components.sound.playSound();

    if (calibrationUIFollowOnSounds[stage]) {
      setTimeout(() => {
        origin.setAttribute('sound', {src: calibrationUIFollowOnSounds[stage], autoplay: true})
        origin.components.sound.playSound();
      }, 2000)
    }
  },

  reachedHooks() {

    // special case for step 6 -> 7 transition, based on reaching hooks again,
    // not based on nods...

    if (this.stage === 'review') {
      this.moveToStage('done')
    }
  },

  nodEvent() {

    let yPos

    switch (this.stage) {

      case 'start':
        // At this nod, we set the position of '#rack' to the current headset position (x & z co-ords only)
        const rack = document.querySelector('#rack')
        const position = this.cameraWorldPosition
        const quaternion = this.cameraWorldQuaternion

        this.el.sceneEl.camera.getWorldPosition(position);
        this.el.sceneEl.camera.getWorldQuaternion(quaternion);
        rack.object3D.position.x = position.x
        rack.object3D.position.y = 0
        rack.object3D.position.z = position.z

        // rotate forward vector by quaternion, zero out y axis component, then find
        // quaternion that rotates forward to this vector.
        // That's the vector to use for the rack orientation
        const forward = this.forwardVector
        const direction = this.directionVector
        direction.copy(forward)
        direction.applyQuaternion(quaternion)
        direction.y = 0
        direction.normalize()

        rack.object3D.quaternion.setFromUnitVectors(forward, direction)

        this.moveToStage('bar')
        break

      case 'bar':
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
        // No action
        // Final move step 6 -> 7 is based on 'reached-hooks' event
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
                                      imageSelector: calibrationUIImages[this.stage]})
  }
})

AFRAME.registerComponent('calibration-ui', {

  schema: {
    imageSelector: {type: 'string'},
    saving: {default: false},  // to re-implement
    deleting: {default: false}, // to re-implement
  },

  init() {
    this.circle = document.createElement('a-entity')
    this.circle.setAttribute('geometry', 'primitive: circle; radius: 1')
    this.circle.setAttribute('material', 'color: white; opacity: 0.8; transparent: true')
    this.el.appendChild(this.circle)

  },

  createImage(src) {

    this.image = document.createElement('a-image')
    this.image.setAttribute('alpha-test', 0.5)
    this.image.setAttribute('width', 2)
    this.image.setAttribute('height', 2)
    this.image.setAttribute('transparent', true)
    this.image.object3D.position.z = 0.001
    this.image.setAttribute('src', src)
    this.circle.appendChild(this.image)

  },

  deleteImage() {

    if (this.image) {
      this.image.parentNode.removeChild(this.image)
      this.image = null
    }
  },

  update() {
    this.deleteImage()
    if (this.data.imageSelector) {
   
      this.createImage(this.data.imageSelector)
    }
  }
});
