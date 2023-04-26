(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/aframe-polygon-wireframe/index.js":
/*!********************************************************!*\
  !*** ./node_modules/aframe-polygon-wireframe/index.js ***!
  \********************************************************/
/***/ (() => {

AFRAME.registerComponent("polygon-wireframe", {

    schema: {
        color: { type: 'color', default: 'grey' },
        opacity: { type: 'number', default: 1 },
        hiddenOpacity: { type: 'number', default: 0 },
        dashed: { type: 'boolean', default: false },
        dashSize: { type: 'number', default: 3 },
        gapSize: { type: 'number', default: 1 },
        dashScale: { type: 'number', default: 30 },
    },

    init() {

      this.updateGeometry = this.updateGeometry.bind(this)
      this.el.addEventListener('object3dset', this.updateGeometry)
      if (this.el.getObject3D('mesh')) {
        this.updateGeometry()
      }
    },

    updateGeometry() {

      const baseGeometry = this.el.getObject3D('mesh').geometry
      if (!baseGeometry) {
        return
      }

      if (this.edges) {
        this.edges.dispose()
      }

      this.edges = new THREE.EdgesGeometry(baseGeometry);
      this.update()
    },

    update() {

      const oldMaterial = this.material
      const oldLine = this.line
      const oldHiddenMaterial = this.hiddenMaterial
      const oldHiddenLine = this.hiddenLine

      const data = this.data

      this.material = this.createLineMaterial(data.color, data.opacity)

      if (data.hiddenOpacity !== 0 && 
          data.hiddenOpacity !== data.opacity) {
        // separate material needed for hidden parts
        this.hiddenMaterial = this.createLineMaterial(data.color, data.hiddenOpacity)

        if (data.hiddenOpacity > data.opacity) {
          console.warn("Opacity of hidden parts cannot be higher than the opacity of non-hidden parts")
          console.warn("Wireframe will be rendered with opacity ", data.hiddenOpacity, " as set on hiddenOpacity property.")
        }
      }
      else {
        this.hiddenMaterial = null
      }

      if (data.hiddenOpacity !== 0) {
        const material = this.hiddenMaterial || this.material
        material.depthWrite = false
        material.depthTest = false
        material.toneMapped = false
      }
      
      this.line = new THREE.LineSegments( this.edges, this.material );
      this.line.computeLineDistances();
      this.el.object3D.add( this.line );

      if (this.hiddenMaterial) {
        this.hiddenLine = new THREE.LineSegments( this.edges, this.hiddenMaterial );
        this.hiddenLine.computeLineDistances();
        this.el.object3D.add( this.hiddenLine );
      }

      this.el.getObject3D('mesh').visible = false;

      // dispose of any old materials & lines
      function removeLineAndMaterial(line, material) {
        if (line) {
          line.removeFromParent()
        }
        if (material) {
          material.dispose()
        }
      }
      this.removeLineAndMaterial(oldLine, oldMaterial)
      this.removeLineAndMaterial(oldHiddenLine, oldHiddenMaterial)
    },

    removeLineAndMaterial(line, material) {
      if (line) {
        line.removeFromParent()
      }
      if (material) {
        material.dispose()
      }
    },

    createLineMaterial(color, opacity) {

      const data = this.data
      let material
      if (!data.dashed) {
          material = new THREE.LineBasicMaterial( { color: color } )
      }
      else {
          material = new THREE.LineDashedMaterial( { color: color,
                                                     dashSize: data.dashSize,
                                                     gapSize: data.gapSize,
                                                     scale: data.dashScale } )
      }
      material.opacity = opacity
      if (opacity !== 1) {
        material.transparent = true
      }

      return material
    },

    remove() {

      this.el.removeEventListener('object3dset', this.updateGeometry)
      this.el.getObject3D('mesh').visible = true;
      if (this.edges) {
        this.edges.dispose()
      }

      this.removeLineAndMaterial(this.line, this.material)
    }
})

/***/ }),

/***/ "./src/bar-monitor.js":
/*!****************************!*\
  !*** ./src/bar-monitor.js ***!
  \****************************/
/***/ (() => {

// component set on scene.
// Contains configuration of key bar thresholds.
// Monitors bar position and generates events when thresholds are hit.
AFRAME.registerComponent('bar-monitor', {

  dependencies: ['bar-position'],

  schema: {
    // Position of bar when on hooks (before the lift begins)
    // Co-ordinates in rack space.
    hookPosition : {type: 'vec3', default: {x: 0, y: 1.5, z: -0.5}},

    // height of bar when lifter is standing up straight.
    topHeight : {default: 0},

    // target depth for bar, to achieve parallel thighs.
    targetDepth: {default: 0},

    // height of the bar when it hits the safety pins.
    safetyPinHeight: {default: 0},

    // width of rack in meters
    rackWidth: {default: 1},

    // depth (z-direction) of rack in meters
    rackDepth: {default: 1},

    // whether to show planes
    showPlanes: {default: true},

    // opacity of planes (if used)
    opacity: {default: 0.3}

  },

  init() {

    this.state = {
      insideRack : false,
      lifterAtHooks : false,
      barOnShoulders : false,
      atTop : false,
      belowDepth : false,
      belowSafetyPins : false,
    }
   },

  update() {
    this.deletePlanes()

    if (this.data.showPlanes) {
      this.createPlanes()
    }
  },

  createPlanes() {

    this.aboveTopPlane = this.createPlane(this.data.topHeight, 'outline', 'white')
    this.topPlaneUpwards = this.createPlane(this.data.topHeight - 0.05, 'outline', 'green')
    //this.topPlaneDownwards = this.createPlane(this.data.topHeight - 0.05, , 'outline', 'white')
    this.depthPlaneUpwards = this.createPlane(this.data.targetDepth, 'outline', 'green')
    //this.depthPlaneDownwards = this.createPlane(this.data.targetDepth, , 'outline', 'white')
    this.safetyPlaneTop = this.createPlane(this.data.safetyPinHeight, 'outline', 'orange')
    this.safetyPlaneBottom = this.createPlane(this.data.safetyPinHeight - 0.05, 'outline', 'red')
  },

  deletePlanes() {

    deletePlane = (plane) => {
      if (plane) {
        plane.parentNode.removeChild(plane)
      }
    }

    deletePlane(this.aboveTopPlane)
    deletePlane(this.topPlaneUpwards)
    deletePlane(this.topPlaneDownwards)
    deletePlane(this.depthPlaneUpwards)
    deletePlane(this.depthPlaneDownwards)
    deletePlane(this.safetyPlaneTop)
    deletePlane(this.safetyPlaneBottom)

    this.aboveTopPlane = null
    this.aboveTopPlane = null
    this.topPlaneUpwards = null
    this.topPlaneDownwards = null
    this.depthPlaneUpwards = null
    this.depthPlaneDownwards = null
    this.safetyPlaneTop = null
    this.safetyPlaneBottom = null
  },

  createPlane(height, style, color, side) {
    const plane = document.createElement('a-plane')
    plane.setAttribute('width', this.data.rackWidth)
    plane.setAttribute('height', this.data.rackDepth)
    plane.object3D.position.y = height
    plane.object3D.rotation.x = Math.PI / 2

    if (style === 'transparent') {
      plane.setAttribute('material', {opacity: this.data.opacity,
                                      transparent: true,
                                      color: color,
                                      side: side})
    }
    else {
      console.assert(style === 'outline')
      plane.setAttribute('polygon-wireframe', {color: color})
    }

    const rackEl = document.querySelector('#rack')
    rackEl.appendChild(plane)

    return plane
  },

  isInsideRack(barPosition) {

    let insideLR, insideFB

    if (Math.abs(barPosition.x - this.data.hookPosition.x) < this.data.rackWidth / 2) {
      insideLR = true
    }

    // zOffset relative to hook Position will be positive (up to rack depth)
    // or very small negative (to 10cm tolerance) when inside the rack.
    const zOffset = barPosition.z - this.data.hookPosition.z
    if ((zOffset) < this.data.rackDepth && 
        (zOffset) > -0.1) {
      insideFB = true
    }

    return (insideLR && insideFB)

  },

  checkIfInsideRack(barPosition) {
    if (this.isInsideRack(barPosition)) {

      if (!this.state.insideRack) {
        this.el.emit('entered-rack')
      }

      this.state.insideRack = true
    }
    else {
      if (this.state.insideRack) {
        this.el.emit('exited-rack')
      }

      this.state.insideRack = false
    }

    return this.state.insideRack
  },

  isAtHooks(barPosition) {

    let atHooksLR, atHooksFB

    // for L-R, anywhere in rack will do.
    if (Math.abs(barPosition.x - this.data.hookPosition.x) < this.data.rackWidth / 2) {
      atHooksLR = true
    }

    // 10cm tolerance for Front-Back.

    // Note: user can subvert logic by bringing in bar very close to pins, then lowering directly in front of pins.
    // App will assume bar has been returned to rack, when in fact it's still on users' shoulders.
    // This behaviour seems really unlikely to happen, unless user is deliberatly trying to subvert the app...

    // Not sure we can do any better without introducing risk of false negatives when bar
    // is legitimately returned to the hooks.
    if (Math.abs(this.data.hookPosition.z - barPosition.z) < 0.05) {
      atHooksFB = true
    }

    return atHooksLR && atHooksFB
  },

  checkIfAtHooks(barPosition) {

    if (this.isAtHooks(barPosition)) {
      if (!this.state.lifterAtHooks) {
        this.el.emit('reached-hooks')
      }
      this.state.lifterAtHooks = true
    }
    else {
      if (this.state.lifterAtHooks) {
        // lifter leaving hooks.
        // may or may not have bar on shoulders.  Determine based on y position.

        if (barPosition.y > this.data.hookPosition.y) {
          // bar above hooks - must be on shoulders.

          if (!this.state.barOnShoulders) {

            this.el.emit('shouldered-bar')
          }
          
          this.state.barOnShoulders = true
        }
        else {
          // bar below hooks - must have deposited it back on the hooks.

          if (this.state.barOnShoulders) {

            this.el.emit('returned-bar')
          }
          
          this.state.barOnShoulders = false
        }

        this.el.emit('left-hooks')
      }
      this.state.lifterAtHooks = false
    }

    return this.state.lifterAtHooks
  },

  isAtTop(barPosition) {

    // 5cm tolerance.  Anything over top is considered at top.
    if (this.data.topHeight - barPosition.y < 0.05) {
      return true
    }
    else {
      return false
    }
  },

  checkIfAtTop(barPosition) {
    if (this.isAtTop(barPosition)) {

      if (!this.state.atTop) {
        this.el.emit('hit-top')
      }

      this.state.atTop = true
    }
    else {
      if (this.state.atTop) {
        this.el.emit('lowered-from-top')
      }

      this.state.atTop = false
    }

    return this.state.atTop
  },

  isBelowDepth(barPosition) {

    // Below target depth.  No tolerance - must pass target depth.
    if (barPosition.y < this.data.targetDepth) {
      return true
    }
    else {
      return false
    }
  },

  checkIfBelowDepth(barPosition) {
    if (this.isBelowDepth(barPosition)) {

      if (!this.state.belowDepth) {
        this.el.emit('hit-target-depth')
      }

      this.state.belowDepth = true
    }
    else {
      if (this.state.belowDepth) {
        this.el.emit('upwards-from-target-depth')
      }

      this.state.belowDepth = false
    }

    return this.state.belowDepth
  },

  isBelowSafetyPins(barPosition) {

    // Below safety pins
    // wait until fully 5cm below, to be sure lifter is bailing out, not just performing a deep rep.
    if (barPosition.y < (this.data.safetyPinHeight - 0.05)) {
      return true
    }
    else {
      return false
    }
  },

  checkIfBelowSafetyPins(barPosition) {
    if (this.isBelowSafetyPins(barPosition)) {

      if (!this.state.belowSafetyPins) {
        this.el.emit('below-safety-pins')
      }

      this.state.belowSafetyPins = true
    }
    else {
      if (this.state.belowSafetyPins) {
        this.el.emit('bailed-out')

        // following bail-out, bar is no longer on the shoulders.
        this.state.barOnShoulders = false
      }

      this.state.belowSafetyPins = false
    }

    return this.state.belowSafetyPins
  },

  tick() {
    barPosition = this.el.sceneEl.components['bar-position'].barPosition

    // is the lifter inside the rack?
    const insideRack = this.checkIfInsideRack(barPosition)

    // if not inside rack, nothing else can happen.
    if (!insideRack) return

    // is the lifter at the pins (likely either taking on, or dropping off the bar?)
    // This also updates state about whether or not the lifter has the bar on their shoulders.
    this.checkIfAtHooks(barPosition)

    // is the lifter at the top of a rep?
    this.checkIfAtTop(barPosition)

    // has the lifter gone below target depth?
    this.checkIfBelowDepth(barPosition)

    // has the lifter bailed out on the safety pins?
    this.checkIfBelowSafetyPins(barPosition)

  }
})

/***/ }),

/***/ "./src/bar-position.js":
/*!*****************************!*\
  !*** ./src/bar-position.js ***!
  \*****************************/
/***/ (() => {


// Component set on scene.
// Tracks camera and maintains public data for
// - cameraPostion
// - cameraQuaternion
// - barPosition
// All as measured in rack space.

// No implemented support for switching camera / multi-camera

// as far as possible, we try to work in rack space.
// In rack space, x is left-right and z is forward (+ve) and backward (-ve)
// Typically this will not align with world space.

AFRAME.registerComponent('bar-position', {
  
  init() {
    // called once when component is added to an entity

    // camera position & quaternion in Rack Space.  Updated every tick.
    this.cameraPosition = new THREE.Vector3()
    this.cameraQuaternion = new THREE.Quaternion()

    // for working
    this.tempQuaternion = new THREE.Quaternion()

    // world position of rack.
    this.rackEl = document.querySelector('#rack')
    rack = this.rackEl.object3D
    this.rackInverseTransform = new THREE.Matrix4()
    rack.updateWorldMatrix()
    this.rackInverseTransform.copy(rack.matrixWorld)
    this.rackInverseTransform.invert()

    // now if I apply rackInverseTransform to an object in worldSpace, I get it's transform in rack space.
    // vector to track bar position, in rack-space.
    // Public.
    this.barPosition = new THREE.Vector3()
    
    this.barOffset = new THREE.Vector3()
    // Potential for bar offset, but setting to zero for now.
    // Plane visualization doesn't accoutn for this and would need to be updated if we added this back in.
    //this.barOffset.set(0, -0.1, -0.2)
    this.getCameraAndBarPosition()
    
  },

  getCameraAndBarPosition() {

    const position = this.cameraPosition
    const quaternion = this.cameraQuaternion

    this.el.sceneEl.camera.getWorldPosition(position);
    this.el.sceneEl.camera.getWorldQuaternion(quaternion);

    const rackInverseTransform = this.rackInverseTransform
    position.applyMatrix4(rackInverseTransform)
    this.tempQuaternion.setFromRotationMatrix(rackInverseTransform)
    quaternion.multiply(this.tempQuaternion)

    this.barPosition.addVectors(this.cameraPosition, this.barOffset)

    // bar quaternion is assumed to always be the identity
    // bar in standard orientation across the rack.
  },

  update() {
    // called whenever component properties are updated

  },

  tick() {

    this.getCameraAndBarPosition()
  }
})

/***/ }),

/***/ "./src/calibration-flow.js":
/*!*********************************!*\
  !*** ./src/calibration-flow.js ***!
  \*********************************/
/***/ (() => {

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
      this.playPrompt(this.stage)
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



/***/ }),

/***/ "./src/in-rack-ui.js":
/*!***************************!*\
  !*** ./src/in-rack-ui.js ***!
  \***************************/
/***/ (() => {

AFRAME.registerComponent('inside-rack-ui', {

  schema: {
    totalReps: {default: 5},
    repsToGo: {default: 5},
    width: {default: 4},
    message: {default: ''}
  },

  init() {

    this.reps = []

    for (let ii = 0; ii < this.data.totalReps; ii++) {
      const rep = document.createElement('a-entity')
      rep.setAttribute('rep-report', {repNumber: ii})
      const reps = this.data.totalReps
      rep.object3D.position.x = (ii - (reps - 1) / 2) * (this.data.width / this.data.totalReps)
      this.el.appendChild(rep)
      this.reps.push(rep)
    }

    this.repReport = this.repReport.bind(this)

    this.el.sceneEl.addEventListener('rep-report', this.repReport)

  },

  repReport(e) {

    const data = e.detail
    const {repNumber} = data

    const rep = this.reps[repNumber]

    if (!rep) return // user doing more reps than specified!  We don't report them.

    rep.setAttribute('rep-report', {repNumber: repNumber,
                                    status: data.completed ? 'done' : 'failed',
                                    restPrior: data.restPrior,
                                    timeDown: data.timeDown,
                                    depth: data.depth,
                                    timeUp: data.timeUp,
                                    turnSPeed: data.turnSpeed,
                                    daviationLR: data.deviationLR, 
                                    deviationFB: data.deviationFB})
  }
});

AFRAME.registerComponent('rep-report', {
  schema: {
    repNumber: { type: 'number'},
    status: { type: 'string', default: 'todo'}, // one of: todo, doing, done, failed
    timeDown: {type: 'number'},
    depth: {type: 'number'},
    timeUp: {type: 'number'},
    turnSpeed: {type: 'number'},
    deviationLR: {type: 'number'},
    deviationFB: {type: 'number'}
  }, 

  init() {

    this.circle = document.createElement('a-circle')
    this.circle.setAttribute('radius', 0.3)
    this.circle.setAttribute('material', {opacity: 0.8, transparent: true})
    this.circle.object3D.position.y = 0.5
    this.el.appendChild(this.circle)

    this.number = document.createElement('a-entity')
    this.number.setAttribute('text', {color: 'black',
                                      wrapCount: 5,
                                      value: this.data.repNumber + 1,
                                      align: 'center'})
    this.circle.appendChild(this.number)

  },

  update() {

    this.deleteImage()

    let imgSrc
    const status = this.data.status
    if (status === 'done') {
      imgSrc = '#check'
    }
    if (status === 'failed') {
      imgSrc = '#cross'
    }
    if (imgSrc) {
      this.createImage(this.circle, imgSrc, 0.4)
    }

    if (status === 'todo' || status === 'doing') {
      this.number.object3D.visible = true
    }
    else {
      this.number.object3D.visible = false
    }
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
})


/***/ }),

/***/ "./src/squat-rack.js":
/*!***************************!*\
  !*** ./src/squat-rack.js ***!
  \***************************/
/***/ (() => {

AFRAME.registerGeometry('squatRack', {

  schema: {
    schema: {
      width: {default: 1},
      depth: {default: 1},
      frontHeight: {default: 2.2},
      rearHeight: {default: 1.8},
      frameWidth: {default: 0.08},
      hookRadiusSmall: {default: 0.02},
      hookRadiusLarge: {default: 0.04},
      hookDepth: {default: 0.08},
      hookHeight: {default: 1.5},
      safetyHeight: {default: 0.75},
      safetyRadius: {default: 0.02},
    },
  },

  init(data) {
    const geometries = []
    let geometry

    // Origin of rack is center of rack, at floor level.

    // post, back left
    geometry = new THREE.BoxGeometry(data.frameWidth, data.rearHeight, data.frameWidth)
    geometry.translate(-data.width / 2, data.rearHeight / 2, data.depth / 2)
    geometries.push(geometry)

    // post, back right
    geometry = new THREE.BoxGeometry(data.frameWidth, data.rearHeight, data.frameWidth)
    geometry.translate(data.width / 2, data.rearHeight / 2, data.depth / 2)
    geometries.push(geometry)

    // post, front left
    geometry = new THREE.BoxGeometry(data.frameWidth, data.frontHeight, data.frameWidth)
    geometry.translate(-data.width / 2, data.frontHeight / 2, -data.depth / 2)
    geometries.push(geometry)

    // post, back right
    geometry = new THREE.BoxGeometry(data.frameWidth, data.frontHeight, data.frameWidth)
    geometry.translate(data.width / 2, data.frontHeight / 2, -data.depth / 2)
    geometries.push(geometry)

    // hooks...
    // left hook
    geometry = new THREE.CylinderGeometry(data.hookRadiusSmall,
                                          data.hookRadiusSmall,
                                          data.hookDepth)
    geometry.rotateX(Math.PI/2)
    geometry.translate(-data.width / 2, data.hookHeight, -data.depth / 2 + data.hookDepth / 2)
    geometries.push(geometry)

    geometry = new THREE.CylinderGeometry(data.hookRadiusLarge,
                                          data.hookRadiusLarge,
                                          0.01)
                                          geometry.rotateX(Math.PI/2)
    geometry.translate(-data.width / 2, data.hookHeight, -data.depth / 2 + data.hookDepth)
    geometries.push(geometry)

    // right hook
    geometry = new THREE.CylinderGeometry(data.hookRadiusSmall,
                                          data.hookRadiusSmall,
                                          data.hookDepth)
    geometry.rotateX(Math.PI/2)
    geometry.translate(data.width / 2, data.hookHeight, -data.depth / 2 + data.hookDepth / 2)
    geometries.push(geometry)

    geometry = new THREE.CylinderGeometry(data.hookRadiusLarge,
                                          data.hookRadiusLarge,
                                          0.01)
                                          geometry.rotateX(Math.PI/2)
    geometry.translate(data.width / 2, data.hookHeight, -data.depth / 2 + data.hookDepth)
    geometries.push(geometry)

    // left safety pin
    geometry = new THREE.CylinderGeometry(data.safetyRadius,
                                          data.safetyRadius,
                                          data.depth)
    geometry.rotateX(Math.PI/2)
    geometry.translate(-data.width / 2, data.safetyHeight, 0)
    geometries.push(geometry)

    // right safety pin
    geometry = new THREE.CylinderGeometry(data.safetyRadius,
                                          data.safetyRadius,
                                          data.depth)
    geometry.rotateX(Math.PI/2)
    geometry.translate(data.width / 2, data.safetyHeight, 0)
    geometries.push(geometry)

    this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
  }

})

AFRAME.registerComponent('squat-rack', {

  schema: {
    width: {default: 1},
    depth: {default: 1},
    frontHeight: {default: 2.2},
    rearHeight: {default: 1.8},
    frameWidth: {default: 0.08},
    hookRadiusSmall: {default: 0.02},
    hookRadiusLarge: {default: 0.04},
    hookDepth: {default: 0.08},
    hookHeight: {default: 1.4},
    safetyHeight: {default: 0.65},
    safetyRadius: {default: 0.02},
  },

  init() {

    this.el.setAttribute('geometry', {primitive: 'squatRack', 
                                      width: this.data.width,
                                      depth: this.data.depth,
                                      frontHeight: this.data.frontHeight,
                                      rearHeight: this.data.rearHeight,
                                      frameWidth: this.data.frameWidth,
                                      hookRadiusSmall: this.data.hookRadiusSmall,
                                      hookRadiusLarge: this.data.hookRadiusLarge,
                                      hookDepth: this.data.hookDepth,
                                      hookHeight: this.data.hookHeight,
                                      safetyHeight: this.data.safetyHeight,
                                      safetyRadius: this.data.safetyRadius})

    this.el.setAttribute('material', {color: '#333'})
  }
})

/***/ }),

/***/ "./src/ui-manager.js":
/*!***************************!*\
  !*** ./src/ui-manager.js ***!
  \***************************/
/***/ (() => {

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
    }
    else {
      updateVisibility(this.calibrationUI, true)
      updateVisibility(this.insideRackUI, false)
      updateVisibility(this.outsideRackUI, false)
    }
  }
})

/***/ }),

/***/ "./src/ui-updater.js":
/*!***************************!*\
  !*** ./src/ui-updater.js ***!
  \***************************/
/***/ (() => {

// Configure on scene.

// Updates UI component(s) to display rep status

AFRAME.registerComponent('ui-updater', {

  init() {

    this.reachedHooks = this.reachedHooks.bind(this)
    this.leftHooks = this.leftHooks.bind(this)
    this.shoulderedBar = this.shoulderedBar.bind(this)
    this.returnedBar = this.returnedBar.bind(this)
    this.hitTop = this.hitTop.bind(this)
    this.loweredFromTop = this.loweredFromTop.bind(this)
    this.hitTargetDepth = this.hitTargetDepth.bind(this)
    this.upwardsFromTargetDepth = this.upwardsFromTargetDepth.bind(this)
    this.belowSafetyPins = this.belowSafetyPins.bind(this)
    this.bailedOut = this.bailedOut.bind(this)

    this.el.addEventListener('reached-hooks', this.reachedHooks);
    this.el.addEventListener('left-hooks', this.leftHooks);
    this.el.addEventListener('shouldered-bar', this.shoulderedBar);
    this.el.addEventListener('returned-bar', this.returnedBar);
    this.el.addEventListener('hit-top', this.hitTop);
    this.el.addEventListener('lowered-from-top', this.loweredFromTop);
    this.el.addEventListener('hit-target-depth', this.hitTargetDepth);
    this.el.addEventListener('upwards-from-target-depth', this.upwardsFromTargetDepth);
    this.el.addEventListener('below-safety-pins', this.belowSafetyPins);
    this.el.addEventListener('bailed-out', this.bailedOut);

    this.state = {
      repPhase: 'none',  // one of: none, ready, down, up, rest
      repNumber: 0,
      repsToGo: 5
    }

    this.insideRackUI = document.querySelector('#inside-rack-ui')
    this.outsideRackUI = document.querySelector('#outside-rack-ui')

    this.repData = {
      repNumber: 0,
      completed: false,
      restPrior: 0,
      timeDown: 0,
      depth: 0,
      timeUp: 0,
      turnSpeed: 0,
      deviationLR: 0,
      deviationFB: 0
    }
  },

  remove() {
    this.el.removeEventListener('reached-hooks', this.reachedHooks);
    this.el.removeEventListener('left-hooks', this.leftHooks);
    this.el.removeEventListener('shouldered-bar', this.shoulderedBar);
    this.el.removeEventListener('returned-bar', this.returnedBar);
    this.el.removeEventListener('hit-top', this.hitTop);
    this.el.removeEventListener('lowered-from-top', this.loweredFromTop);
    this.el.removeEventListener('hit-target-depth', this.hitTargetDepth);
    this.el.removeEventListener('upwards-from-target-depth', this.upwardsFromTargetDepth);
    this.el.removeEventListener('below-safety-pins', this.belowSafetyPins);
    this.el.removeEventListener('bailed-out', this.bailedOut);
  },

  setTargetReps(repCount) {

    this.state.repsToGo = repCount
    this.insideRackUI.setAttribute('inside-rack-ui', {repsToGo: this.state.repsToGo})
  },

  repCompleted(completed) {

    // !! Still need to fill in rep data.
    this.repData.completed = completed
    this.repData.repNumber = this.state.repNumber
    this.el.emit('rep-report', this.repData)
    this.state.repsToGo--
    this.state.repNumber++
    this.insideRackUI.setAttribute('inside-rack-ui', {repsToGo: this.state.repsToGo})
  },

  reachedHooks() {

    this.setMessage('Take weight of bar')
  },

  leftHooks() {
    // no update needed
  },

  shoulderedBar() {
    this.setMessage('Step Back')
  },

  returnedBar() {
    this.setMessage('Finished!')
  },

  setMessage(message) {
    this.insideRackUI.setAttribute('inside-rack-ui', {message: message})
  },

  hitTop() {

    // one of: none, ready, down, up, rest
    switch (this.state.repPhase) {

      case 'none':
        this.state.repPhase = 'ready'
        this.setMessage('Ready!')
        break

      case 'down':
        this.state.repPhase = 'rest'
        this.setMessage('Incomplete Rep')
        break

      case 'up':
        this.state.repPhase = 'rest'
        this.setMessage('Rep Complete')
        this.repCompleted(true)
        break

      default: 
        console.error("Hit Top in unexpected state: ", this.state.repPhase)
    }
  },

  loweredFromTop() {

    // one of: none, ready, down, up, rest
    switch (this.state.repPhase) {

      case 'none':
        this.setMessage('Stand Taller before beginning reps')
        break

      case 'ready':
      case 'rest':
        this.state.repPhase = 'down'
        this.setMessage('Going down...')
        break

      case 'up':
        this.setMessage('Stand at full height to complete last Rep!')
        break

      default: 
        console.error("Lowered From Top in unexpected state: ", this.state.repPhase)
    }

  },

  hitTargetDepth() {

    // one of: none, ready, down, up, rest
    switch (this.state.repPhase) {

      case 'none':
        this.setMessage('Stand at full height before beginning reps')
        break

      case 'down':
        this.setMessage('Hit Depth!')
        this.state.repPhase = 'up'
        break
  
      case 'up':
        this.setMessage('Push up to complete this rep!')
        break

      default: 
        console.error("Lowered From Top in unexpected state: ", this.state.repPhase)
    }
  },

  upwardsFromTargetDepth() {

    // one of: none, ready, down, up, rest
    switch (this.state.repPhase) {

      case 'up':
        // expected.  No action / state change needed
        break

      default: 
        console.error("Lowered From Top in unexpected state: ", this.state.repPhase)
    }
  },

  belowSafetyPins() {

    this.setMessage('Failed set.  Step out of rack and remove weight plates from bar.')

  },

  bailedOut() {
    this.repCompleted(false)
    this.setMessage('Failed set.  Step out of rack and remove weight plates from bar.')
  }
})


/***/ }),

/***/ "./src/vertical-controls.js":
/*!**********************************!*\
  !*** ./src/vertical-controls.js ***!
  \**********************************/
/***/ (() => {

AFRAME.registerComponent('vertical-controls', {

  init() {

    this.verticalVelocity = 0
    this.verticalAcceleration = 0

    this.keyDown = this.keyDown.bind(this)
    this.keyUp = this.keyUp.bind(this)

    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
  },

  keyDown(e) {

    if (e.key === "o") {
      this.verticalAcceleration += 2
    }

    if (e.key === "k") {
      this.verticalAcceleration = -2
    }
  },

  keyUp(e) {
    
    if (e.key === "o" || e.key === "k") {
      this.verticalVelocity = 0
      this.verticalAcceleration = 0
    }
  },

  tick(t, dt) {

    velDelta = dt * this.verticalAcceleration / 1000
    this.verticalVelocity += velDelta
    if (this.verticalVelocity > 1) this.verticalVelocity = 1
    if (this.verticalVelocity < -1) this.verticalVelocity = -1

    yDelta = dt * this.verticalVelocity / 1000
    this.el.object3D.position.y += yDelta
  }
})

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/* global AFRAME, THREE */

__webpack_require__(/*! ./src/bar-position.js */ "./src/bar-position.js")
__webpack_require__(/*! ./src/bar-monitor.js */ "./src/bar-monitor.js")
__webpack_require__(/*! ./src/in-rack-ui.js */ "./src/in-rack-ui.js")
__webpack_require__(/*! ./src/ui-updater.js */ "./src/ui-updater.js")
__webpack_require__(/*! ./src/squat-rack.js */ "./src/squat-rack.js")
__webpack_require__(/*! ./src/vertical-controls.js */ "./src/vertical-controls.js")
//require('./src/nod-shake.js')
__webpack_require__(/*! ./src/calibration-flow */ "./src/calibration-flow.js")
__webpack_require__(/*! ./src/ui-manager */ "./src/ui-manager.js")
__webpack_require__(/*! aframe-polygon-wireframe */ "./node_modules/aframe-polygon-wireframe/index.js")
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=squatmaster.js.map