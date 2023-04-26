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
    topHeight : {default: 1.6},

    // target depth for bar, to achieve parallel thighs.
    targetDepth: {default: 1},

    // height of the bar when it hits the safety pins.
    safetyPinHeight: {default: 0.75},

    // width of rack in meters
    rackWidth: {default: 1},

    // depth (z-direction) of rack in meters
    rackDepth: {default: 1}
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
    // for now, hard code bar 20 cm behind camera, 10cm below
    this.barOffset.set(0, -0.1, -0.2)
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

/***/ "./src/in-rack-ui.js":
/*!***************************!*\
  !*** ./src/in-rack-ui.js ***!
  \***************************/
/***/ (() => {

AFRAME.registerComponent('in-rack-ui', {

  schema: {
    repsToGo: {default: 5},
    message: {default: ''}
  },

  init() {
    this.circle = document.createElement('a-circle')
    this.circle.setAttribute('radius', 0.5)
    this.el.appendChild(this.circle)

    this.text = document.createElement('a-entity')
    this.text.setAttribute('text', {color:  'black',
                                    wrapCount: 15,
                                    align: 'center'})
    this.circle.appendChild(this.text)
  },

  update() {

    this.text.setAttribute('text', `value: ${this.data.message}\n${this.data.repsToGo} reps to go`)

  }
});


/***/ }),

/***/ "./src/nod-shake.js":
/*!**************************!*\
  !*** ./src/nod-shake.js ***!
  \**************************/
/***/ (() => {

// Add to scene (it finds camera itself)
// Generates 'nod' and 'shake' events

AFRAME.registerComponent('nod-shake', {

  schema: {
    // sensitivity is measured in required cmulative radians of rotation (in either direction)
    // without any significant movement that is dominated by another axis.
    // 1 radian = approx 57 degrees
    // For simplicity, we allow nods in both X & Z axis.  Unlikely to trigger false positives as
    // head tilt is an unusual movement.  And means we don't need to worry about the camera's Y rotation.
    // in determining which direction is "nodding"
    nodSensitivity: {default: 0.5},
    shakeSensitivity: {default: 0.5},
    debug: {default: false}
  },

  init() {

    this.cameraQuaternion = new THREE.Quaternion
    this.lastQuaternion = new THREE.Quaternion
    this.deltaQuaternion = new THREE.Quaternion
    this.camera = this.el.sceneEl.camera

    this.firstFrame = true

    this.cumRotNod = 0
    this.cumRotShake = 0

    this.debugDisplayCounter = 0
  },

  update() {
    if (this.data.debug) {
      this.display = document.createElement('a-text')
      this.display.object3D.position.set(0, 0, -3)
      this.display.setAttribute('align', 'center')
      this.display.setAttribute('value', 'Nod/shake debug')
      this.camera.el.appendChild(this.display)
    }
    else {
      if (this.display) {
        this.display.parentNode.removeChild(this.display)
        this.display = null
      }
    }
  },

  // primes debug display to reset 1 second after changes stop.
  primeDebugReset() {
    this.debugDisplayCounter++

    setTimeout(() => {
      this.debugDisplayCounter--
      if (this.debugDisplayCounter <= 0) {
        this.display.setAttribute('text', 'value: Nod/shake debug')
      }
    }, 1000)
  },

  tick() {

    // avoid false positives at start of day
    if (this.firstFrame) {
      this.firstFrame = false
      return
    }

    const quaternion = this.cameraQuaternion
    const delta = this.deltaQuaternion

    this.el.sceneEl.camera.getWorldQuaternion(quaternion);

    // compute delta quaternion from last frame to this frame
    delta.copy(this.lastQuaternion)
    delta.invert()
    delta.premultiply(quaternion)

    // Convert to axis and angle as described here.
    // https://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm   
    delta.normalize()
    const s = Math.sqrt(1-delta.w*delta.w)
    if (s < 0.0001) {
      // no significant movement
    }
    else {

      const angle = 2 * Math.acos(delta.w)
      const absAngle = Math.abs(angle)
      console.log("Absolute angle of rotation: ", absAngle)

      let x = delta.x
      let y = delta.y
      let z = delta.z

      if (Math.abs(x) >= Math.abs(y) && Math.abs(x) >= Math.abs(z)) {
        // x axis dominant
        this.cumRotNod += absAngle
        this.cumRotShake = 0
        
        if (this.data.debug) {
          console.log("X-axis dominant.  Accumulated nod rotation:", this.cumRotNod)
        }
      }
      else if (Math.abs(y) >= Math.abs(x) && Math.abs(y) >= Math.abs(z)) {
        // y axis dominant
        this.cumRotNod = 0
        this.cumRotShake += absAngle
        
        if (this.data.debug) {
          console.log("Y-axis dominant.  Accumulated shake rotation:", this.cumRotShake)
        }
      }
      else {
        // z-axis dominant
        this.cumRotNod += absAngle
        this.cumRotShake = 0

        if (this.data.debug) {
          console.log("Z-axis dominant.  Accumulated nod rotation:", this.cumRotNod)
        }
      }
    }

    // has any cumulative rotation broken threshold?
    if (this.cumRotNod > this.data.nodSensitivity) {
      this.el.emit("nod")
      this.cumRotNod = 0

      if (this.data.debug) {
        console.log("Emitted nod event")
        this.display.setAttribute('text', 'value: Detected nod')
        this.primeDebugReset()
      }
    }

    if (this.cumRotShake > this.data.shakeSensitivity) {
      this.el.emit("shake")
      this.cumRotShake = 0

      if (this.data.debug) {
        console.log("Emitted shake event")
        this.display.setAttribute('text', 'value: Detected shake')
        this.primeDebugReset()
      }
    }

    // save off this quaternion for analysis next frame
    this.lastQuaternion.copy(quaternion)
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
    hookHeight: {default: 1.5},
    safetyHeight: {default: 0.75},
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

/***/ "./src/ui-updater.js":
/*!***************************!*\
  !*** ./src/ui-updater.js ***!
  \***************************/
/***/ (() => {

// Configure on scene.

// Updates UI component(s) to display rep status

AFRAME.registerComponent('ui-updater', {

  init() {

    this.enteredRack = this.enteredRack.bind(this)
    this.exitedRack = this.exitedRack.bind(this)
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

    this.el.addEventListener('entered-rack', this.enteredRack);
    this.el.addEventListener('exited-rack', this.exitedRack);
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
      repsToGo: 0
    }

    this.insideRackUI = document.querySelector('#inside-rack-ui')
    this.outsideRackUI = document.querySelector('#outside-rack-ui')

  },

  remove() {
    this.el.removeEventListener('entered-rack', this.enteredRack);
    this.el.removeEventListener('exited-rack', this.exitedRack);
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
    this.insideRackUI.setAttribute('in-rack-ui', {repsToGo: this.state.repsToGo})
  },

  repCompleted() {

    this.state.repsToGo--
    this.insideRackUI.setAttribute('in-rack-ui', {repsToGo: this.state.repsToGo})
  },

  enteredRack() {

    if (this.insideRackUI) {
      this.insideRackUI.setAttribute('visible', true)
    }
    
    if (this.outsideRackUI) {
      this.outsideRackUI.setAttribute('visible', false)
    }

    this.setTargetReps(5)

  },

  exitedRack() {

    if (this.insideRackUI) {
      this.insideRackUI.setAttribute('visible', false)
    }
    
    if (this.outsideRackUI) {
      this.outsideRackUI.setAttribute('visible', true)
    }
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
    this.insideRackUI.setAttribute('in-rack-ui', {message: message})
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
        this.repCompleted()
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
__webpack_require__(/*! ./src/nod-shake.js */ "./src/nod-shake.js")
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=squatmaster.js.map