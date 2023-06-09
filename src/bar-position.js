
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