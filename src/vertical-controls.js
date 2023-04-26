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