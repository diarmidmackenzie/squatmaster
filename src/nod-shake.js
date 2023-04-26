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
    nodSensitivity: {default: 0.25},
    shakeSensitivity: {default: 0.25},
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