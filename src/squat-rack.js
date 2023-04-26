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
      safetyHeight: {default: 0.5},
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
    safetyHeight: {default: 0.5},
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