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
    const {repNumber, completed, failed} = data

    console.log("Rep Report", data)

    const rep = this.reps[repNumber]

    if (!rep) return // user doing more reps than specified!  We don't report them.

    let status

    if (completed) {
      status = failed ? 'failed' : 'done'
    }
    else {
      status = 'doing'
    }
    rep.setAttribute('rep-report', {repNumber: repNumber,
                                    status: status,
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
    restPrior: {type: 'number'},
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
