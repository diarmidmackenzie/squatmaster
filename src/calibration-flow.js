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
  bar: '#sound4',
  hooks: '#sound5',
  top: '#sound7', 
  depth: '#sound8',
  safety: '#sound9',
  review: '#sound10',
  done: '#sound11',
}

const calibrationUIFollowOnSounds = {
  start: '#sound2',
  hooks: '#sound6',
  top: '#sound6',
  depth: '#sound6',
  safety: '#sound6',
  done: '#sound12',
}

const calibrationUIFollowOnSounds2 = {
  start: '#sound3'
}

AFRAME.registerComponent('calibration-flow', {

  dependencies: ['bar-position'],

  schema: {
    skip: {default: false} // for testing: skip calibration & just set up with some defaults.
  },

  init() {

    this.reachedHooks = this.reachedHooks.bind(this)
    this.forwardEvent = this.forwardEvent.bind(this)
    this.backEvent = this.backEvent.bind(this)
    
    this.el.addEventListener('click-forward', this.forwardEvent);
    this.el.addEventListener('click-back', this.backEvent);
    this.el.addEventListener('reached-hooks', this.reachedHooks);

    // UI state
    this.stage = 'start' // one of: start, hooks, top, depth, safety, review, done
    
    this.calibrationUI = document.getElementById('calibration-ui')

    this.cameraWorldPosition = new THREE.Vector3()
    this.cameraWorldQuaternion = new THREE.Quaternion()
    this.forwardVector = new THREE.Vector3(0, 0, -1)
    this.directionVector = new THREE.Vector3()

    this.el.addEventListener('enter-vr', () => {
      this.playSFX('#sfx-welcome')
      setTimeout(() => this.playPrompt(this.stage), 5000)
      
      const video = document.querySelector('#video1')
      if (video) {
        video.play()
      }
    })

    if (this.data.skip) {

      this.el.setAttribute('bar-monitor', 
                            `topHeight: 1.6;
                             targetDepth: 0.9;
                             safetyPinHeight: 0.75`)

      this.endCalibrationProcess()
    }
  },

  update() {
    this.updateUI()
  },

  remove() {
    this.el.removeEventListener('click-forward', this.forwardEvent);
    this.el.removeEventListener('click-back', this.backEvent);
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

  moveToStage(stage) {

    this.playPrompt(stage)
    this.stage = stage
    this.updateUI()
  },

  // equivalent function when moving back a stage...
  moveBackToStage(stage) {

    this.playPrompt(stage)
    this.stage = stage
    this.updateUI()
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

    if (calibrationUIFollowOnSounds2[stage]) {
      setTimeout(() => {
        origin.setAttribute('sound', {src: calibrationUIFollowOnSounds2[stage], autoplay: true})
        origin.components.sound.playSound();
      }, 4000)
    }
  },

  playSFX(src) {
    const origin = document.getElementById('sfx-origin')

    origin.setAttribute('sound', {src: src, autoplay: true})
  },

  reachedHooks() {

    // special case for step 6 -> 7 transition, based on reaching hooks again,
    // not based on nods...

    if (this.stage === 'review') {
      this.moveToStage('done')
    }
  },

  forwardEvent() {

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
        console.error("Hit Forward in unexpected state: ", this.stage)
        break
    }
  },

  backEvent() {

    switch (this.stage) {

      case 'start':
        // no effect
        break

      case 'bar':
        this.moveBackToStage('start')
        break

      case 'hooks':
        this.moveBackToStage('bar')
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
        this.moveBackToStage('review')
        break
         
      default:
        console.error("Hit Back in unexpected state: ", this.stage)
        break
    }
  },

  updateUI() {

    const forward = (this.stage !== 'review') 
    const back = (this.stage !== 'start')

    this.calibrationUI.setAttribute('calibration-ui',
                                     {saving: this.saving,
                                      deleting: this.deleting,
                                      forwardButton: forward,
                                      backButton: back,
                                      imageSelector: calibrationUIImages[this.stage]})
  }
})

AFRAME.registerComponent('calibration-ui', {

  schema: {
    imageSelector: {type: 'string'},
    fowardButton: {default: false}, 
    backButton: {default: false}
  },

  init() {
    this.circle = document.createElement('a-entity')
    this.circle.setAttribute('geometry', 'primitive: circle; radius: 1; segments: 128')
    this.circle.setAttribute('material', 'color: white; opacity: 0.8; transparent: true')
    this.el.appendChild(this.circle)
  },

  update() {

    this.deleteImage()
    if (this.data.imageSelector) {
   
      this.createImage(this.circle, this.data.imageSelector, 2)
    }

    this.deleteButtons() 
    this.createButtons()
  },

  createButtons() {

    if (this.data.forwardButton && !this.data.backButton) {
      this.forwardButton = this.createButton(0, -1, '#check', 'click-forward')
    }

    if (!this.data.forwardButton && this.data.backButton) {
      this.backButton = this.createButton(0, -1, '#cross', 'click-back')
    }

    if (this.data.forwardButton && this.data.backButton) {
      this.forwardButton = this.createButton(0.4, -1, '#check', 'click-forward')
      this.backButton = this.createButton(-0.4, -1, '#cross', 'click-back')
    }
  },

  createButton(x, y, imageSrc, eventName) {

    button = document.createElement('a-entity')
    button.object3D.position.x = x
    button.object3D.position.y = y
    button.object3D.position.z = 0.001
    button.setAttribute('animated-button', {imageSrc: imageSrc, eventName: eventName})
    this.circle.appendChild(button)

    return button
  },

  deleteButtons() {

    deleteButton = (el) => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
    deleteButton(this.forwardButton)
    deleteButton(this.backButton)
    this.forwardButton = null
    this.backButton = null
  },

  createImage(parent, src, dimension) {

    this.image = document.createElement('a-image')
    this.image.setAttribute('alpha-test', 0.1)
    this.image.setAttribute('width', dimension)
    this.image.setAttribute('height', dimension)
    this.image.setAttribute('transparent', true)
    this.image.object3D.position.z = 0.001
    this.image.setAttribute('src', src)
    parent.appendChild(this.image)

  },

  deleteImage() {

    if (this.image) {
      this.image.parentNode.removeChild(this.image)
      this.image = null
    }
  }
});

AFRAME.registerComponent('animated-button', {

  schema: {
    imageSrc : {type: 'string'},
    eventName: {type: 'string'}
  },

  init() {

    const button = document.createElement('a-entity')
    button.setAttribute('geometry', 'primitive: circle; radius: 0.28; segments: 128')
    button.setAttribute('material', 'color: white; opacity: 0.8; transparent: true; shader: flat')
    button.classList.add('clickable');
    this.el.appendChild(button)
  
    const ring = document.createElement('a-ring')
    ring.setAttribute('radius-inner', 0.28)
    ring.setAttribute('radius-outer', 0.29)
    ring.setAttribute('segments-theta', 128)
    ring.setAttribute('segments-phi', 1)
    ring.setAttribute('material', 'color: grey; shader: flat')
    ring.object3D.position.z = 0.001
    button.appendChild(ring)
  
    this.createImage(button, this.data.imageSrc, 0.3)
  
    const animatedRing = document.createElement('a-ring')
    animatedRing.setAttribute('radius-inner', 0.25)
    animatedRing.setAttribute('radius-outer', 0.32)
    animatedRing.setAttribute('segments-theta', 128)
    animatedRing.setAttribute('segments-phi', 1)
    animatedRing.setAttribute('theta-start', 90)
    animatedRing.setAttribute('theta-length', 0)
    animatedRing.setAttribute('scale', '-1 1 1')
    animatedRing.setAttribute('material', 'color: grey; shader: flat')
  
    animatedRing.object3D.position.z = 0.001
    ring.appendChild(animatedRing)
  
    button.addEventListener('fusing', () => {
      animatedRing.setAttribute('animation', {property: 'geometry.thetaLength',
                                              from: 0,
                                              to: 360,
                                              dur: 1000,
                                              easing: 'linear'})
    })
  
    button.addEventListener('mouseleave', () => {
      animatedRing.removeAttribute('animation')
      animatedRing.setAttribute('geometry', 'thetaLength: 0')
    })
  
    button.addEventListener('click', () => {
      this.el.sceneEl.emit(this.data.eventName)
    })
  },

  createImage(parent, src, dimension) {

    this.image = document.createElement('a-image')
    this.image.setAttribute('alpha-test', 0.1)
    this.image.setAttribute('width', dimension)
    this.image.setAttribute('height', dimension)
    this.image.setAttribute('transparent', true)
    this.image.object3D.position.z = 0.001
    this.image.setAttribute('src', src)
    parent.appendChild(this.image)

  }

})

