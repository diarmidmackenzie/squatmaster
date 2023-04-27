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
        this.playPrompt('#sound-here-we-go')
        break

      case 'down':
        this.state.repPhase = 'rest'
        this.setMessage('Incomplete Rep')
        this.playPrompt('#sound-not-quite')
        break

      case 'up':
        this.state.repPhase = 'rest'
        this.setMessage('Rep Complete')
        this.repCompleted(true)
        if (this.state.repsToGo === 1) {
          this.playPrompt('#sound-last-one') 
        }
        else {
          this.playPrompt('#sound-nice')
        }
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
        this.playSFX('#sfx-hit-depth')
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
  },

  playPrompt(src) {

    // don't play these clips until calibration is done.
    const state = this.el.sceneEl.components['ui-manager'].state
    if (!state.calibrated) return

    const origin = document.getElementById('sound-origin')

    origin.removeAttribute('sound')
    origin.setAttribute('sound', {src: src, autoplay: true})
  },

  playSFX(src) {

    // don't play these clips until calibration is done.
    const state = this.el.sceneEl.components['ui-manager'].state
    if (!state.calibrated) return
    
    const origin = document.getElementById('sfx-origin')

    origin.setAttribute('sound', {src: '', autoplay: false})
    origin.setAttribute('sound', {src: src, autoplay: true})
  }

})
