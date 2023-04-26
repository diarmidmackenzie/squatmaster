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
    topHeight : {default: 1.7},

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