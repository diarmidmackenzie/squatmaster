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
                                    restPrior: data.restPrior / 1000, // msecs -> secs
                                    timeDown: data.timeDown / 1000, // msecs -> secs
                                    depth: -data.depth * 100, // m -> cm, flip sign.
                                    timeUp: data.timeUp / 1000, // msecs -> secs
                                    turnSpeed: data.turnSpeed,
                                    deviationFB: data.deviationFB * 100, // m -> cm
                                    deviationLR: data.deviationLR * 100}) // m -> cm
  }
});

const reportStats = [
  {key: 'restPrior', label: 'Rest', units: 's'},
  {key: 'timeDown', label: 'Rest', units: 's'},
  {key: 'depth', label: 'Rest', units: 'cm'},
  {key: 'timeUp', label: 'Rest', units: 's'},
  {key: 'deviationFB', label: 'Deviation F-B', units: 'cm'},
  {key: 'deviationLR', label: 'Deviation L-R', units: 'cm'}
]

AFRAME.registerComponent('rep-report', {
  schema: {
    repNumber: { type: 'number'},
    status: { type: 'string', default: 'todo'}, // one of: todo, doing, done, failed
    restPrior: {type: 'number', default: undefined},
    timeDown: {type: 'number', default: undefined},
    depth: {type: 'number', default: undefined},
    timeUp: {type: 'number', default: undefined},
    turnSpeed: {type: 'number', default: undefined},
    deviationFB: {type: 'number', default: undefined},
    deviationLR: {type: 'number', default: undefined}
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

    this.childStats = []
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

    this.deleteReportStats()

    reportStats.forEach((stat, index) => {
      const {key, units} = stat

      if (this.data[key] || this.data[key] === 0) {
        const child = document.createElement('a-entity')
        child.setAttribute('rep-report-stat', {
          value: this.data[key],
          ypos: -0.2 - (index * 0.7),
          units: units
        })
        this.el.appendChild(child)
        this.childStats.push(child)
      }
    })
  },

  deleteReportStats() {
    this.childStats.forEach((el) => {
      el.parentNode.removeChild(el)
    })
    this.childStats = []
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


AFRAME.registerComponent('rep-report-stat', {
  schema: {
    value: { type: 'number'},
    ypos: {type: 'number'},
    units: {type: 'string'}
  }, 

  init() {

    this.circle = document.createElement('a-circle')
    this.circle.setAttribute('radius', 0.3)
    this.circle.setAttribute('material', {opacity: 0.8, transparent: true, color: 'white'})
    this.circle.object3D.position.y = this.data.ypos
    this.el.appendChild(this.circle)

    this.number = document.createElement('a-entity')

    this.circle.appendChild(this.number)
  },

  update() {
    const numberText = this.data.value.toFixed(1) + this.data.units
    this.number.removeAttribute('text')
    this.number.setAttribute('text', {color: 'black',
                                      wrapCount: 10,
                                      value: numberText,
                                      align: 'center'})
    
    if (this.data.value < 0) {
      this.circle.setAttribute('material', {color: 'orange'})
    }
    else {
      this.circle.setAttribute('material', {color: 'white'})
    }
  }
})
