AFRAME.registerComponent('xy-plot', {

  schema: {
    resolution: {default: 1024},
    lineColor: {default: 'white'},
    lineWidth: {default: 2},
    xmin: {default: 0},
    xmax: {default: 1},
    ymin: {default: 0},
    ymax: {default: 1},
  },

  events: {
    'plot-point': function (e) {
      this.addPoint(e.detail.x, e.detail.y)
    },
    'clear-plot': function () {
      this.clear()
    }
  },

  init() {

    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext("2d");
    
    this.canvasTexture = new THREE.CanvasTexture(this.canvas)
    const mesh = this.el.getObject3D('mesh')
    mesh.material.map = this.canvasTexture

    this.points = []

  },

  update() {
    this.canvas.width = this.data.resolution
    this.canvas.height = this.data.resolution
    this.canvasTexture.needsUpdate = true

    const ctx = this.canvas.getContext("2d")
    ctx.strokeStyle = this.data.lineColor
    ctx.lineWidth = this.data.lineWidth

  },

  addPoint(x, y) {

    const ctx = this.canvas.getContext("2d")

    const data = this.data
    const {xmin, ymin, resolution} = data
    const xrange = data.xmax - xmin
    const yrange = data.ymax - ymin

    canvasX = resolution * (x - xmin) / xrange 
    canvasY = this.canvas.height - (resolution * (y - ymin) / yrange)

    const point = {x: canvasX, y: canvasY}
    this.points.push(point)

    const length = this.points.length
    if (length > 1) {
      const begin = this.points[length - 2]
      const end = this.points[length - 1]
      ctx.beginPath()
      ctx.moveTo(begin.x, begin.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
      this.canvasTexture.needsUpdate = true
    }
  },

  clear() {

    this.points.length = 0
    
    const canvas = this.canvas
    const ctx = this.canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    this.canvasTexture.needsUpdate = true

  }
})